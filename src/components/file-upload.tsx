import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { uploadFile } from "@/lib/storage";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

interface FileUploadProps {
  folder: string;
  onUploaded: (info: { path: string; url: string; name: string }) => void;
  accept?: string;
  label?: string;
}

export function FileUpload({ folder, onUploaded, accept, label }: FileUploadProps) {
  const { lang } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handle = async (f: File) => {
    setBusy(true);
    try {
      const { path, url } = await uploadFile(folder, f);
      onUploaded({ path, url, name: f.name });
      toast.success(lang === "bn" ? "আপলোড সম্পন্ন" : "Uploaded");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handle(f);
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Upload className="w-4 h-4 mr-2" />
        )}
        {label ?? (lang === "bn" ? "ফাইল আপলোড" : "Upload file")}
      </Button>
    </div>
  );
}
