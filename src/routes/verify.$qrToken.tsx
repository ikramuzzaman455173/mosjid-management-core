import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, fmtDate } from "@/lib/i18n";
import { User, CheckCircle, XCircle, Droplet, Phone, Calendar, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/verify/$qrToken")({
  component: VerifyMemberPage,
});

function VerifyMemberPage() {
  const { qrToken } = Route.useParams();
  const { lang } = useI18n();

  const { data: member, isLoading, error } = useQuery({
    queryKey: ["verify-member", qrToken],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("members")
        .select("id, member_code, full_name, membership_type, phone, blood_group, status, photo_url, expiry_date, joining_date")
        .eq("qr_token", qrToken)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return data;
    },
    retry: false
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-[#005B3A] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">{lang === "bn" ? "ভেরিফাই করা হচ্ছে..." : "Verifying..."}</p>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border-t-4 border-red-500">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {lang === "bn" ? "সদস্য পাওয়া যায়নি" : "Member Not Found"}
          </h2>
          <p className="text-gray-600 mb-6">
            {lang === "bn" ? "এই QR কোডটি কোনো বৈধ সদস্যের সাথে যুক্ত নয়।" : "This QR code is not associated with any valid member."}
          </p>
          <a href="/" className="inline-block bg-[#005B3A] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#004a2f] transition-colors">
            {lang === "bn" ? "হোম পেজে যান" : "Go to Home"}
          </a>
        </div>
      </div>
    );
  }

  const isActive = member.status === "active" || (member.status as string) === "সক্রিয়" || !member.status;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className={`pt-8 pb-10 px-6 text-center ${isActive ? "bg-[#005B3A]" : "bg-red-600"}`}>
          <div className="w-24 h-24 mx-auto bg-white rounded-full p-1 mb-4 shadow-lg relative">
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
              {member.photo_url ? (
                <img src={member.photo_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-slate-300" />
              )}
            </div>
            {/* Status Badge Icon */}
            <div className={`absolute bottom-0 right-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${isActive ? "bg-green-500" : "bg-red-500"}`}>
              {isActive ? (
                <CheckCircle className="w-4 h-4 text-white" />
              ) : (
                <XCircle className="w-4 h-4 text-white" />
              )}
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-1">{member.full_name}</h1>
          <p className="text-white/80 font-medium mb-3">ID: {member.member_code || member.id.substring(0, 8).toUpperCase()}</p>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-semibold">
            {isActive ? (lang === "bn" ? "সক্রিয় সদস্য" : "Active Member") : (lang === "bn" ? "নিষ্ক্রিয় সদস্য" : "Inactive Member")}
          </div>
        </div>

        {/* Details */}
        <div className="p-6 -mt-4 bg-white rounded-t-3xl">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-[#005B3A]/10 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-[#005B3A]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{lang === "bn" ? "সদস্য ধরন" : "Membership Type"}</p>
                <p className="font-semibold text-gray-900 capitalize">{member.membership_type || "General"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <Droplet className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{lang === "bn" ? "রক্তের গ্রুপ" : "Blood Group"}</p>
                  <p className="font-semibold text-gray-900">{member.blood_group || "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-[#005B3A]/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-[#005B3A]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{lang === "bn" ? "মোবাইল" : "Mobile"}</p>
                  <p className="font-semibold text-gray-900 text-sm truncate">{member.phone || "—"}</p>
                </div>
              </div>
            </div>

            {(member.joining_date || member.expiry_date) && (
              <div className="grid grid-cols-2 gap-4">
                {member.joining_date && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{lang === "bn" ? "যোগদানের তারিখ" : "Join Date"}</p>
                      <p className="font-semibold text-gray-900 text-sm">{fmtDate(member.joining_date, lang)}</p>
                    </div>
                  </div>
                )}
                {member.expiry_date && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{lang === "bn" ? "মেয়াদোত্তীর্ণ" : "Valid Thru"}</p>
                      <p className="font-semibold text-gray-900 text-sm">{fmtDate(member.expiry_date, lang)}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 text-center border-t pt-6 border-slate-100">
            <h3 className="font-bold text-gray-800 text-sm mb-1">
              {lang === "bn" ? "বায়তুল মামুর জামে মসজিদ" : "Baytul Mamur Mosque"}
            </h3>
            <p className="text-xs text-gray-500">
              {lang === "bn" ? "অফিসিয়াল সদস্য ভেরিফিকেশন পোর্টাল" : "Official Member Verification Portal"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
