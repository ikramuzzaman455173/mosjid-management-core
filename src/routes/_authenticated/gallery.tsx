import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, fmtDate } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { DeleteDialog } from "@/components/delete-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, Plus, Trash2, Loader2, UploadCloud, Video, Youtube } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { Hint } from "@/components/ui/hint";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/gallery")({
  component: GalleryPage,
});

function GalleryPage() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const { data: permData } = usePermissions();
  const canCreate = permData?.isSuperAdmin || permData?.permissions?.has("gallery.create");
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "general",
    file: null as File | null,
    media_type: "image",
    video_url: "",
  });

  const { data: images, isLoading } = useQuery({
    queryKey: ["gallery-images"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery_images").select("*").order("created_at", { ascending: false });
      if (error && error.code !== "42P01") throw error; // Ignore table not found if user hasn't run SQL yet
      return data ?? [];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      setUploading(true);
      
      let finalUrl = "";
      
      if (form.media_type === "image") {
        if (!form.file) throw new Error("No file selected");
        const fileExt = form.file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `public/${fileName}`;

        const { error: uploadError } = await supabase.storage.from("gallery").upload(filePath, form.file);
        if (uploadError) {
          setUploading(false);
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage.from("gallery").getPublicUrl(filePath);
        finalUrl = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase.from("gallery_images").insert({
        title: form.title,
        description: form.description,
        category: form.category,
        media_type: form.media_type,
        image_url: form.media_type === "image" ? finalUrl : "",
        video_url: form.media_type === "video" ? form.video_url : null,
      } as any);

      setUploading(false);
      if (insertError) throw insertError;
    },
    onSuccess: () => {
      toast.success(lang === "bn" ? "আপলোড সফল হয়েছে" : "Upload successful");
      qc.invalidateQueries({ queryKey: ["gallery-images"] });
      setOpen(false);
      setForm({ title: "", description: "", category: "general", file: null, media_type: "image", video_url: "" });
    },
    onError: (e: any) => {
      setUploading(false);
      toast.error(e.message);
    },
  });

  const delMutation = useMutation({
    mutationFn: async (img: any) => {
      // Try to delete from storage first (extract filename from URL)
      try {
        const urlObj = new URL(img.image_url);
        const pathSegments = urlObj.pathname.split('/');
        const fileName = pathSegments[pathSegments.length - 1];
        await supabase.storage.from("gallery").remove([`public/${fileName}`]);
      } catch (e) {
        // Ignore storage delete errors if file is already gone or url is malformed
      }

      const { error } = await supabase.from("gallery_images").delete().eq("id", img.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("deleted"));
      qc.invalidateQueries({ queryKey: ["gallery-images"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ImageIcon}
        title={lang === "bn" ? "গ্যালারি" : "Gallery"}
        subtitle={`${images?.length ?? 0} ${lang === "bn" ? "টি ছবি" : "photos"}`}
        actionLabel={canCreate ? (lang === "bn" ? "ছবি আপলোড" : "Upload Photo") : undefined}
        onAction={canCreate ? () => setOpen(true) : undefined}
      />

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Card key={`gallery-skel-${i}`} className="overflow-hidden border-none shadow-none">
              <Skeleton className="aspect-square w-full rounded-xl" />
            </Card>
          ))}
        </div>
      ) : images?.length === 0 ? (
        <div className="text-center p-12 bg-muted/20 rounded-xl border border-dashed border-border/50">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
          <p className="text-muted-foreground">{lang === "bn" ? "কোনো ছবি পাওয়া যায়নি" : "No photos found"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {images?.map((img: any) => (
            <Card key={img.id} className="overflow-hidden group relative">
              <div className="aspect-square bg-muted relative">
                {img.media_type === "video" && img.video_url ? (
                  <iframe 
                    src={img.video_url.replace("watch?v=", "embed/")} 
                    className="w-full h-full object-cover"
                    allowFullScreen
                    title={img.title ?? "Video"}
                  />
                ) : (
                  <img src={img.image_url} alt={img.title ?? "Gallery image"} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3 pointer-events-none">
                  <h4 className="text-white font-medium text-sm truncate">{img.title ?? "Untitled"}</h4>
                  <p className="text-white/70 text-xs truncate">{fmtDate(img.created_at, lang)}</p>
                </div>
                <PermissionGuard module="Gallery" action="Delete" fallback={<></>}>
                  <Hint label={t("delete")}><Button 
                    size="icon" 
                    variant="destructive" 
                    className="absolute top-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setDeleteId(img)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button></Hint>
                </PermissionGuard>
                {img.category && (
                  <Badge variant="secondary" className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm shadow-sm pointer-events-none">
                    {img.category}
                  </Badge>
                )}
                {img.media_type === "video" && (
                  <Badge className="absolute bottom-2 right-2 bg-red-600 pointer-events-none">
                    <Youtube className="w-3 h-3 mr-1" /> Video
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{lang === "bn" ? "নতুন মিডিয়া আপলোড" : "Upload New Media"}</DialogTitle>
          </DialogHeader>
          <Tabs value={form.media_type} onValueChange={(v) => setForm({...form, media_type: v})}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="image"><ImageIcon className="w-4 h-4 mr-2" /> Image</TabsTrigger>
              <TabsTrigger value="video"><Video className="w-4 h-4 mr-2" /> Video</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="space-y-4 py-2">
            {form.media_type === "image" ? (
              <div>
                <Label required>{lang === "bn" ? "ছবি নির্বাচন করুন" : "Select Image"}</Label>
                <div className="mt-1 flex items-center gap-3">
                  <Input type="file" accept="image/*" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] ?? null })} className="cursor-pointer" />
                </div>
              </div>
            ) : (
              <div>
                <Label required>{lang === "bn" ? "ভিডিও বা ইউটিউব লিংক" : "Video or YouTube Link"}</Label>
                <div className="mt-1">
                  <Input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
                </div>
              </div>
            )}
            <div>
              <Label>{t("title")}</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={lang === "bn" ? "ছবির শিরোনাম" : "Image title"} />
            </div>
            <div>
              <Label>{t("category")}</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="jummah">Jummah</SelectItem>
                  <SelectItem value="ramadan">Ramadan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{lang === "bn" ? "বিবরণ" : "Description"}</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={lang === "bn" ? "ছবির বিস্তারিত বিবরণ (ঐচ্ছিক)" : "Image description (optional)"} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={uploading}>
              {lang === "bn" ? "বাতিল" : "Cancel"}
            </Button>
            <Button onClick={() => uploadMutation.mutate()} disabled={uploading || (form.media_type === "image" ? !form.file : !form.video_url)}>
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
              {lang === "bn" ? "সেভ করুন" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DeleteDialog id={deleteId} onClose={() => setDeleteId(null)} onConfirm={(id) => delMutation.mutate(id)} />
    </div>
  );
}
