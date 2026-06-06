import { forwardRef } from "react";
import { useI18n, fmtCurrency, fmtDate } from "@/lib/i18n";
import { QRCodeSVG } from "qrcode.react";

export interface ReceiptData {
  id: string;
  type: "subscription" | "donation" | "other";
  date: string;
  amount: number;
  name: string;
  memberId?: string;
  details?: string;
  phone?: string;
}

export const PrintableReceipt = forwardRef<HTMLDivElement, { data: ReceiptData }>(({ data }, ref) => {
  const { lang } = useI18n();

  // Basic number to words for Bengali (simplified)
  const numberToWordsBn = (num: number) => {
    // In a full app, use a proper library like num-to-words-bn, for now, simple string representation
    return lang === "bn" ? `${num} টাকা মাত্র` : `${num} BDT only`;
  };

  const getTitle = () => {
    if (data.type === "subscription") return lang === "bn" ? "চাঁদা আদায়ের রশিদ" : "Subscription Receipt";
    if (data.type === "donation") return lang === "bn" ? "দান ও অনুদানের রশিদ" : "Donation Receipt";
    return lang === "bn" ? "মানি রিসিপ্ট" : "Money Receipt";
  };

  return (
    <div ref={ref} className="p-8 max-w-2xl mx-auto bg-white text-black font-sans print:shadow-none shadow-md border my-4 print:my-0 print:border-none">
      <div className="text-center border-b-2 border-primary/20 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-primary mb-1">
          {lang === "bn" ? "বায়তুল মামুর জামে মসজিদ" : "Baytul Mamur Jame Mosque"}
        </h1>
        <p className="text-sm text-gray-600">
          {lang === "bn" ? "মাইজঘোনা দক্ষিণ নতুন পাড়া, বাংলাদেশ" : "Maizghona Dakkhin Natun Para, Bangladesh"}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {lang === "bn" ? "মোবাইল: ০১৭১২-৩৪৫৬৭৮ | ইমেইল: info@mosque.com" : "Mobile: 01712-345678 | Email: info@mosque.com"}
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full font-bold border border-primary/20">
          {getTitle()}
        </div>
        <div className="text-right text-sm">
          <p><span className="font-semibold">{lang === "bn" ? "রশিদ নং:" : "Receipt No:"}</span> {data.id.substring(0, 8).toUpperCase()}</p>
          <p><span className="font-semibold">{lang === "bn" ? "তারিখ:" : "Date:"}</span> {fmtDate(data.date, lang)}</p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-[150px_10px_1fr] items-center border-b border-dashed border-gray-300 pb-2">
          <span className="font-semibold text-gray-700">{lang === "bn" ? "নাম / প্রদানকারী" : "Received From"}</span>
          <span>:</span>
          <span className="font-medium text-lg">{data.name} {data.memberId ? `(${data.memberId})` : ""}</span>
        </div>
        
        {data.phone && (
          <div className="grid grid-cols-[150px_10px_1fr] items-center border-b border-dashed border-gray-300 pb-2">
            <span className="font-semibold text-gray-700">{lang === "bn" ? "মোবাইল নম্বর" : "Mobile No"}</span>
            <span>:</span>
            <span className="font-medium">{data.phone}</span>
          </div>
        )}

        <div className="grid grid-cols-[150px_10px_1fr] items-center border-b border-dashed border-gray-300 pb-2">
          <span className="font-semibold text-gray-700">{lang === "bn" ? "টাকার পরিমাণ" : "Amount"}</span>
          <span>:</span>
          <span className="font-bold text-xl">{fmtCurrency(data.amount, lang)}</span>
        </div>

        <div className="grid grid-cols-[150px_10px_1fr] items-center border-b border-dashed border-gray-300 pb-2">
          <span className="font-semibold text-gray-700">{lang === "bn" ? "কথায়" : "In Words"}</span>
          <span>:</span>
          <span className="font-medium italic text-gray-600 capitalize">{numberToWordsBn(data.amount)}</span>
        </div>

        <div className="grid grid-cols-[150px_10px_1fr] items-center border-b border-dashed border-gray-300 pb-2">
          <span className="font-semibold text-gray-700">{lang === "bn" ? "বিবরণ" : "Description"}</span>
          <span>:</span>
          <span className="font-medium">{data.details || (lang === "bn" ? "মসজিদের তহবিলে জমা" : "Deposited to Mosque Fund")}</span>
        </div>
      </div>

      <div className="flex justify-between items-end mt-16 pt-8">
        <div className="flex flex-col items-center">
          <QRCodeSVG 
            value={`Receipt:${data.id}|Amt:${data.amount}|Date:${data.date}`} 
            size={80} 
            level="L" 
            includeMargin={false} 
          />
          <span className="text-[10px] text-gray-400 mt-2">Scan for verification</span>
        </div>
        
        <div className="text-center">
          <div className="w-40 border-t border-gray-800 pt-2">
            <p className="font-semibold">{lang === "bn" ? "আদায়কারীর স্বাক্ষর" : "Receiver Signature"}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-gray-400 border-t border-gray-100 pt-4">
        {lang === "bn" 
          ? "এই রশিদটি সফটওয়্যার দ্বারা স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে।" 
          : "This receipt is automatically generated by the software."}
      </div>
    </div>
  );
});

PrintableReceipt.displayName = "PrintableReceipt";
