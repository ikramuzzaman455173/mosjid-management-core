import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, fmtCurrency, fmtDate } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { DeleteDialog } from "@/components/delete-dialog";
import { DataTable, type Column } from "@/components/data-table";
import { CrudDialog } from "@/components/crud-dialog";
import { PrintableIdCard, type IdCardData } from "@/components/printable-id-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { Users, Pencil, Trash2, IdCard, Plus, X, MessageSquare, Send, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { useReactToPrint } from "react-to-print";
import { toPng } from "html-to-image";
import { sendSms } from "@/lib/sms";
import { Hint } from "@/components/ui/hint";

export const Route = createFileRoute("/_authenticated/members")({
  component: MembersPage,
});

type Member = {
  id: string;
  member_code: string | null;
  full_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  monthly_subscription: number | null;
  membership_type: string | null;
  status: string | null;
  joining_date: string | null;
  blood_group: string | null;
  expiry_date: string | null;
  qr_token: string | null;
  photo_url?: string | null;
  family_info?: any[] | null;
};

const empty = {
  member_code: "",
  full_name: "",
  phone: "",
  email: "",
  address: "",
  monthly_subscription: 200,
  membership_type: "general",
  status: "active",
  blood_group: "",
  expiry_date: "",
  qr_token: "",
  photo_url: "",
  family_info: [] as any[],
};

function MembersPage() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const { data: permData } = usePermissions();
  const canCreate = permData?.isSuperAdmin || permData?.permissions?.has("members.create");
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<any>(null);
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);
  const [smsMember, setSmsMember] = useState<Member | null>(null);
  const [smsMsg, setSmsMsg] = useState("");
  const [sendingSms, setSendingSms] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `members/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from("gallery").upload(fileName, file);
      if (uploadError) {
        // Fallback: If bucket doesn't exist, read as base64
        if (uploadError.message.includes("Bucket not found") || uploadError.message.includes("row-level security")) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setForm({ ...form, photo_url: reader.result as string });
            setUploadingImage(false);
          };
          reader.readAsDataURL(file);
          return;
        }
        throw uploadError;
      }

      const { data } = supabase.storage.from("gallery").getPublicUrl(fileName);
      setForm({ ...form, photo_url: data.publicUrl });
      toast.success(lang === "bn" ? "ছবি আপলোড হয়েছে" : "Photo uploaded");
    } catch (err: any) {
      console.error(err);
      toast.error(lang === "bn" ? "ছবি আপলোডে সমস্যা" : "Failed to upload photo");
    } finally {
      setUploadingImage(false);
    }
  };

  const printRef = useRef<HTMLDivElement>(null);
  const [printData, setPrintData] = useState<IdCardData | null>(null);
  const [showIdModal, setShowIdModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!printRef.current || !printData) return;
    
    try {
      setIsDownloading(true);
      // Wait a moment for rendering
      await new Promise(r => setTimeout(r, 100));
      
      const dataUrl = await toPng(printRef.current, { 
        quality: 1.0,
        pixelRatio: 2, // High resolution
      });
      
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `ID_Card_${printData.memberCode || printData.id.substring(0, 8)}.png`;
      link.click();
      
      toast.success(lang === "bn" ? "আইডি কার্ড ডাউনলোড হয়েছে" : "ID Card downloaded");
    } catch (error) {
      console.error("Error generating ID card image:", error);
      toast.error(lang === "bn" ? "ডাউনলোড করতে সমস্যা হয়েছে" : "Failed to download");
    } finally {
      setIsDownloading(false);
    }
  };

  const triggerPrint = (data: IdCardData) => {
    setPrintData(data);
    setShowIdModal(true);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const { data, error } = await supabase.from("members").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Member[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = { ...form, monthly_subscription: Number(form.monthly_subscription) || 0 };
      if (!payload.qr_token) {
        payload.qr_token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      }
      if (editing) {
        const { error } = await supabase.from("members").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("members").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(t("saved"));
      qc.invalidateQueries({ queryKey: ["members"] });
      setOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("deleted"));
      qc.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleSendSms = async () => {
    if (!smsMember?.phone) return toast.error(lang === "bn" ? "ফোন নম্বর নেই" : "No phone number");
    if (!smsMsg.trim()) return;
    
    setSendingSms(true);
    const success = await sendSms(smsMember.phone, smsMsg);
    setSendingSms(false);
    
    if (success) {
      toast.success(lang === "bn" ? "এসএমএস পাঠানো হয়েছে" : "SMS sent successfully");
      setSmsMember(null);
      setSmsMsg("");
    } else {
      toast.error(lang === "bn" ? "এসএমএস পাঠাতে ব্যর্থ হয়েছে। সেটিংস চেক করুন।" : "Failed to send SMS. Check settings.");
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };
  const openEdit = (m: Member) => {
    setEditing(m);
    setForm({
      member_code: m.member_code ?? "",
      full_name: m.full_name,
      phone: m.phone ?? "",
      email: m.email ?? "",
      address: m.address ?? "",
      monthly_subscription: Number(m.monthly_subscription ?? 0),
      membership_type: m.membership_type ?? "general",
      status: m.status ?? "active",
      blood_group: m.blood_group ?? "",
      expiry_date: m.expiry_date ?? "",
      qr_token: m.qr_token ?? "",
      photo_url: m.photo_url ?? "",
      family_info: m.family_info ?? [],
    });
    setOpen(true);
  };

  const addFamilyMember = () => {
    setForm(prev => ({ ...prev, family_info: [...prev.family_info, { name: "", relation: "", age: "" }] }));
  };

  const updateFamilyMember = (index: number, field: string, value: string) => {
    const newFamily = [...form.family_info];
    newFamily[index] = { ...newFamily[index], [field]: value };
    setForm(prev => ({ ...prev, family_info: newFamily }));
  };

  const removeFamilyMember = (index: number) => {
    setForm(prev => ({ ...prev, family_info: prev.family_info.filter((_, i) => i !== index) }));
  };

  const columns: Column<Member>[] = [
    { key: "code", header: t("name"), cell: (m) => (
      <div>
        <div className="font-medium">{m.full_name}</div>
        <div className="text-xs text-muted-foreground">{m.member_code ?? "—"}</div>
      </div>
    )},
    { key: "phone", header: t("phone"), cell: (m) => m.phone ?? "—" },
    { key: "sub", header: t("subscription"), cell: (m) => fmtCurrency(Number(m.monthly_subscription ?? 0), lang) },
    { key: "type", header: t("type"), cell: (m) => <Badge variant="outline">{m.membership_type ?? "—"}</Badge> },
    { key: "status", header: t("status"), cell: (m) => (
      <Badge className={m.status === "active" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>
        {m.status ?? "—"}
      </Badge>
    )},
    { key: "joined", header: t("date"), cell: (m) => fmtDate(m.joining_date, lang) },
    { key: "act", header: t("actions"), className: "text-right", cell: (m) => (
      <div className="flex gap-1 justify-end">
        <Hint label={lang === "bn" ? "হোয়াটসঅ্যাপ মেসেজ" : "WhatsApp Message"}>
          <Button size="icon" variant="outline" className="text-[#25D366] border-[#25D366] hover:bg-[#25D366]/10" onClick={() => {
            if (!m.phone) return toast.error(lang === "bn" ? "ফোন নম্বর নেই" : "No phone number");
            let waPhone = m.phone.replace(/[^0-9+]/g, '');
            if (waPhone.length === 11 && waPhone.startsWith('01')) waPhone = '88' + waPhone;
            window.open(`https://wa.me/${waPhone}`, '_blank');
          }}>
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
          </Button>
        </Hint>
        <Hint label={lang === "bn" ? "এসএমএস পাঠান" : "Send SMS"}>
          <Button size="icon" variant="outline" className="text-primary border-primary hover:bg-primary/10" onClick={() => {
            if (!m.phone) return toast.error(lang === "bn" ? "ফোন নম্বর নেই" : "No phone number");
            setSmsMember(m);
          }}>
            <MessageSquare className="w-4 h-4" />
          </Button>
        </Hint>
        <Hint label={lang === "bn" ? "আইডি কার্ড প্রিন্ট" : "Print ID Card"}>
          <Button size="icon" variant="outline" className="text-primary border-primary hover:bg-primary/10" onClick={() => {
            triggerPrint({
              id: m.id,
              memberCode: m.member_code ?? "",
              name: m.full_name,
              phone: m.phone ?? "",
              type: m.membership_type ?? "General",
              bloodGroup: m.blood_group ?? "",
              address: m.address ?? "",
              photoUrl: m.photo_url ?? "",
              joinDate: fmtDate(m.joining_date, lang),
              expiryDate: m.expiry_date ? fmtDate(m.expiry_date, lang) : "",
            });
          }}>
            <Printer className="w-4 h-4" />
          </Button>
        </Hint>
        <PermissionGuard module="Members" action="Edit" fallback={<></>}>
          <Hint label={t("edit")}><Button size="icon" variant="ghost" onClick={() => openEdit(m)}><Pencil className="w-4 h-4" /></Button></Hint>
        </PermissionGuard>
        <PermissionGuard module="Members" action="Delete" fallback={<></>}>
          <Hint label={t("delete")}><Button size="icon" variant="ghost" onClick={() => setDeleteId(m.id)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button></Hint>
        </PermissionGuard>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Users}
        title={t("members")}
        subtitle={`${data?.length ?? 0} ${t("persons")}`}
        actionLabel={canCreate ? t("new_member") : undefined}
        onAction={canCreate ? openAdd : undefined}
      />

      <DataTable
        data={data}
        columns={columns}
        loading={isLoading}
        searchKeys={["full_name", "phone", "member_code", "email"]}
      />

      <CrudDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? t("edit") : t("new_member")}
        onSubmit={() => save.mutate()}
        saving={save.isPending}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2 flex items-center gap-4 border p-3 rounded-md bg-muted/10">
            <div className="w-16 h-16 rounded-full bg-muted border overflow-hidden flex items-center justify-center shrink-0">
              {form.photo_url ? (
                <img src={form.photo_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Users className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <Label>{lang === "bn" ? "সদস্যের ছবি" : "Member Photo"}</Label>
              <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="mt-1" />
              {uploadingImage && <p className="text-xs text-primary mt-1 flex items-center"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Uploading...</p>}
            </div>
          </div>
          <div>
            <Label>Member Code</Label>
            <Input value={form.member_code} onChange={(e) => setForm({ ...form, member_code: e.target.value })} placeholder="M-001" />
          </div>
          <div>
            <Label required>{t("name")}</Label>
            <Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder={lang === "bn" ? "যেমন: আব্দুর রহমান" : "e.g. Abdur Rahman"} />
          </div>
          <div>
            <Label>{t("phone")}</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" />
          </div>
          <div>
            <Label>{t("email")}</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="example@email.com" />
          </div>
          <div>
            <Label>{t("subscription")} (৳)</Label>
            <Input type="number" min="0" value={form.monthly_subscription} onChange={(e) => setForm({ ...form, monthly_subscription: Number(e.target.value) })} placeholder="500" />
          </div>
          <div>
            <Label>{t("type")}</Label>
            <Select value={form.membership_type} onValueChange={(v) => setForm({ ...form, membership_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="founder">Founder</SelectItem>
                <SelectItem value="lifetime">Lifetime</SelectItem>
                <SelectItem value="honorary">Honorary</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t("status")}</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{lang === "bn" ? "রক্তের গ্রুপ" : "Blood Group"}</Label>
            <Select value={form.blood_group} onValueChange={(v) => setForm({ ...form, blood_group: v })}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                  <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{lang === "bn" ? "মেয়াদোত্তীর্ণের তারিখ" : "Expiry Date"}</Label>
            <DatePicker  value={form.expiry_date} onChange={(v) => setForm({ ...form, expiry_date: v })} />
          </div>
          <div className="col-span-1 md:col-span-2">
            <Label>{t("address")}</Label>
            <Textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder={lang === "bn" ? "সম্পূর্ণ ঠিকানা লিখুন..." : "Enter full address..."} />
          </div>

          <div className="col-span-1 md:col-span-2 border-t pt-4 mt-2">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold text-primary">{lang === "bn" ? "পরিবারভিত্তিক তথ্য" : "Family Information"}</Label>
              <Button type="button" variant="outline" size="sm" onClick={addFamilyMember}>
                <Plus className="w-4 h-4 mr-1" /> {lang === "bn" ? "সদস্য যোগ করুন" : "Add Member"}
              </Button>
            </div>
            
            <div className="space-y-4">
              {form.family_info.map((fm, idx) => (
                <div key={idx} className="flex gap-2 items-start bg-muted/20 p-2 rounded-md border border-border/50">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <div>
                      <Input value={fm.name} onChange={(e) => updateFamilyMember(idx, "name", e.target.value)} placeholder={lang === "bn" ? "নাম" : "Name"} className="h-8 text-sm" />
                    </div>
                    <div>
                      <Input value={fm.relation} onChange={(e) => updateFamilyMember(idx, "relation", e.target.value)} placeholder={lang === "bn" ? "সম্পর্ক (যেমন: পিতা)" : "Relation"} className="h-8 text-sm" />
                    </div>
                    <div>
                      <Input value={fm.age} onChange={(e) => updateFamilyMember(idx, "age", e.target.value)} placeholder={lang === "bn" ? "বয়স" : "Age"} type="number" className="h-8 text-sm" />
                    </div>
                  </div>
                  <Hint label={lang === "bn" ? "সদস্য মুছুন" : "Remove Member"} side="top">
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeFamilyMember(idx)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </Hint>
                </div>
              ))}
              {form.family_info.length === 0 && (
                <div className="text-sm text-muted-foreground italic text-center py-4 bg-muted/20 rounded border border-dashed">
                  {lang === "bn" ? "পরিবারের কোনো সদস্য যোগ করা হয়নি" : "No family members added"}
                </div>
              )}
            </div>
          </div>
        </div>
      </CrudDialog>
      <DeleteDialog id={deleteId} onClose={() => setDeleteId(null)} onConfirm={(id) => del.mutate(id)} />
      
      {/* Hidden Print Area - Must not be display:none for html2canvas */}
      <div className="absolute -top-[10000px] -left-[10000px]">
        {printData && <PrintableIdCard ref={printRef} data={printData} />}
      </div>

      {/* ID Card Preview Modal */}
      <Dialog open={showIdModal} onOpenChange={setShowIdModal}>
        <DialogContent className="max-w-3xl bg-slate-50">
          <div className="flex flex-col h-full max-h-[85vh]">
            <div className="flex items-center justify-between border-b pb-3 px-2">
              <h3 className="font-semibold text-lg">{lang === "bn" ? "সদস্য আইডি কার্ড" : "Member ID Card"}</h3>
              <Button onClick={handleDownload} disabled={isDownloading} className="gap-2">
                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                {isDownloading ? (lang === "bn" ? "ডাউনলোড হচ্ছে..." : "Downloading...") : (lang === "bn" ? "ডাউনলোড করুন" : "Download")}
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto py-6 flex justify-center items-center custom-scrollbar">
              {printData && (
                <div className="scale-90 md:scale-100 origin-top transform-gpu">
                  <PrintableIdCard data={printData} />
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* SMS Dialog */}
      <Dialog open={!!smsMember} onOpenChange={(o) => !o && setSmsMember(null)}>
        <DialogContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{lang === "bn" ? "এসএমএস পাঠান" : "Send SMS"}</h3>
              <p className="text-sm text-muted-foreground">{lang === "bn" ? "প্রাপক:" : "To:"} {smsMember?.full_name} ({smsMember?.phone})</p>
            </div>
            <div>
              <Textarea 
                rows={4} 
                value={smsMsg} 
                onChange={(e) => setSmsMsg(e.target.value)} 
                placeholder={lang === "bn" ? "আপনার মেসেজ লিখুন..." : "Type your message..."} 
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSmsMember(null)}>{lang === "bn" ? "বাতিল" : "Cancel"}</Button>
              <Button onClick={handleSendSms} disabled={sendingSms || !smsMsg.trim()}>
                {sendingSms ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                {lang === "bn" ? "পাঠান" : "Send"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
