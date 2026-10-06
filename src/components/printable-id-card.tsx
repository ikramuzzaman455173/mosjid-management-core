import { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useI18n } from "@/lib/i18n";
import {
  User,
  Droplet,
  Phone,
  Globe,
  Mail,
  AlertTriangle,
  Shield,
  CreditCard,
  Users,
  QrCode,
  Bell,
  FileText,
  Heart,
} from "lucide-react";

export interface IdCardData {
  id: string;
  memberCode: string;
  name: string;
  phone: string;
  type: string;
  bloodGroup?: string;
  address?: string;
  joinDate?: string;
  expiryDate?: string;
  photoUrl?: string;
  qrToken?: string;
  status?: string;
}

// Mosque SVG Icon (arch/dome style matching the image)
const MosqueIcon = ({ size = 32, color = "#D4AF37" }: { size?: number; color?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Minarets */}
    <rect x="4" y="20" width="5" height="22" rx="1" fill={color} />
    <rect x="39" y="20" width="5" height="22" rx="1" fill={color} />
    <rect x="5" y="16" width="3" height="6" rx="1" fill={color} />
    <rect x="40" y="16" width="3" height="6" rx="1" fill={color} />
    <ellipse cx="6.5" cy="16" rx="2.5" ry="3" fill={color} />
    <ellipse cx="41.5" cy="16" rx="2.5" ry="3" fill={color} />
    {/* Small top domes on minarets */}
    <ellipse cx="6.5" cy="13" rx="1.5" ry="2" fill={color} />
    <ellipse cx="41.5" cy="13" rx="1.5" ry="2" fill={color} />
    {/* Main dome */}
    <path d="M12 42V28C12 20.268 17.373 14 24 14C30.627 14 36 20.268 36 28V42H12Z" fill={color} />
    <ellipse cx="24" cy="14" rx="7" ry="5" fill={color} />
    <ellipse cx="24" cy="10" rx="3.5" ry="4.5" fill={color} />
    {/* Crescent on top */}
    <path d="M24 6.5C22.5 4.5 23 2 24 1.5C25.5 3 25 5.5 24 6.5Z" fill={color} />
    {/* Door */}
    <path
      d="M20 42V35C20 32.791 21.791 31 24 31C26.209 31 28 32.791 28 35V42H20Z"
      fill="rgba(0,0,0,0.3)"
    />
    {/* Windows */}
    <ellipse cx="17" cy="30" rx="2" ry="3" fill="rgba(0,0,0,0.2)" />
    <ellipse cx="31" cy="30" rx="2" ry="3" fill="rgba(0,0,0,0.2)" />
    {/* Base line */}
    <rect x="2" y="41" width="44" height="3" rx="1" fill={color} />
  </svg>
);

// Mosque silhouette for back card watermark
const MosqueSilhouette = () => (
  <svg width="160" height="80" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="40" width="8" height="55" rx="2" fill="#005B3A" />
    <rect x="187" y="40" width="8" height="55" rx="2" fill="#005B3A" />
    <ellipse cx="9" cy="38" rx="5" ry="8" fill="#005B3A" />
    <ellipse cx="191" cy="38" rx="5" ry="8" fill="#005B3A" />
    <ellipse cx="9" cy="30" rx="3" ry="5" fill="#005B3A" />
    <ellipse cx="191" cy="30" rx="3" ry="5" fill="#005B3A" />
    <path d="M20 95V60C20 38 35 22 100 22C165 22 180 38 180 60V95H20Z" fill="#005B3A" />
    <ellipse cx="100" cy="22" rx="25" ry="15" fill="#005B3A" />
    <ellipse cx="100" cy="10" rx="12" ry="13" fill="#005B3A" />
    <path d="M95 4C91 0 92 -4 100 -3C108 -4 109 0 105 4C102 6 98 6 95 4Z" fill="#005B3A" />
    {/* Secondary minarets */}
    <rect x="30" y="55" width="6" height="40" rx="1" fill="#005B3A" />
    <rect x="164" y="55" width="6" height="40" rx="1" fill="#005B3A" />
    <ellipse cx="33" cy="53" rx="4" ry="6" fill="#005B3A" />
    <ellipse cx="167" cy="53" rx="4" ry="6" fill="#005B3A" />
    <rect x="0" y="93" width="200" height="7" rx="2" fill="#005B3A" />
  </svg>
);

export const PrintableIdCard = forwardRef<HTMLDivElement, { data: IdCardData }>(({ data }, ref) => {
  const { lang } = useI18n();
  const isActive = data.status === "active" || data.status === "সক্রিয়" || !data.status;
  const memberCode = data.memberCode || data.id.substring(0, 8).toUpperCase();

  // Format expiry date for display
  const formatExpiry = (dateStr?: string) => {
    if (!dateStr) return "31 DEC 2025";
    try {
      const d = new Date(dateStr);
      const months = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
      ];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      ref={ref}
      className="font-sans flex flex-col md:flex-row gap-6 p-4 justify-center items-start print:block print:p-0 print:gap-4 print:space-y-4"
      style={{ fontFamily: "'Noto Sans Bengali', 'Hind Siliguri', sans-serif" }}
    >
      {/* ===================== FRONT OF ID CARD ===================== */}
      {/* Professional frame wrapper */}
      <div
        style={{
          padding: "3px",
          borderRadius: "13px",
          background: "linear-gradient(145deg, #005B3A 0%, #D4AF37 50%, #005B3A 100%)",
          boxShadow: "0 4px 16px rgba(0,91,58,0.18), 0 1px 4px rgba(0,0,0,0.08)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: "2px",
            borderRadius: "11px",
            background: "linear-gradient(145deg, #fff9f0 0%, #ffffff 50%, #f0f7f4 100%)",
          }}
        >
          <div
            className="relative overflow-hidden bg-white print:break-after-avoid print:page-break-after-avoid print:m-0"
            style={{
              width: "242px",
              height: "385px",
              minWidth: "242px",
              minHeight: "385px",
              borderRadius: "9px",
              boxShadow: "none",
              border: "none",
            }}
          >
            {/* ── Header ── */}
            <div
              className="absolute top-0 left-0 right-0 z-10"
              style={{
                background: "linear-gradient(135deg, #004d30 0%, #006B40 60%, #005B3A 100%)",
                height: "110px",
                borderBottomLeftRadius: "18px",
                borderBottomRightRadius: "18px",
              }}
            >
              {/* subtle pattern overlay */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 50%, rgba(212,175,55,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)",
                }}
              />

              {/* Top row: logo + member id */}
              <div className="relative flex items-start justify-between px-3 pt-2.5">
                {/* Mosque icon circle */}
                <div className="flex flex-col items-center">
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.12)",
                      border: "1.5px solid rgba(212,175,55,0.6)",
                    }}
                  >
                    <MosqueIcon size={26} color="#D4AF37" />
                  </div>
                </div>

                {/* Member ID */}
                <div className="text-right">
                  <p
                    style={{
                      fontSize: "7px",
                      color: "rgba(255,255,255,0.75)",
                      letterSpacing: "2px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      marginBottom: "2px",
                    }}
                  >
                    MEMBER ID
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#D4AF37",
                      fontWeight: 800,
                      letterSpacing: "0.5px",
                      lineHeight: 1,
                    }}
                  >
                    {memberCode}
                  </p>
                </div>
              </div>

              {/* Mosque name block */}
              <div className="relative text-center px-3 mt-1">
                <p
                  style={{
                    fontSize: "7.5px",
                    color: "rgba(255,255,255,0.85)",
                    fontWeight: 500,
                    marginBottom: "2px",
                    lineHeight: 1.2,
                  }}
                >
                  {lang === "bn" ? "মাইজেমানা দক্ষিণ নতুন পাড়া" : "Maizemana Dakhin Notun Para"}
                </p>
                <h2
                  style={{
                    fontSize: "13.5px",
                    fontWeight: 900,
                    color: "#ffffff",
                    lineHeight: 1.2,
                    marginBottom: "2px",
                  }}
                >
                  {lang === "bn" ? "বায়তুল মামুর জামে মসজিদ" : "Baytul Mamur Jame Mosque"}
                </h2>
                <p
                  style={{
                    fontSize: "6.5px",
                    color: "#D4AF37",
                    fontStyle: "italic",
                    fontWeight: 500,
                    lineHeight: 1,
                  }}
                >
                  {lang === "bn"
                    ? "আধুনিক প্রযুক্তিতে মসজিদ ব্যবস্থাপনা এখন আরও সহজ"
                    : "Modern technology makes mosque management easier"}
                </p>
              </div>
            </div>

            {/* ── Member Info Section ── */}
            <div
              className="absolute z-10"
              style={{ top: "118px", left: 0, right: 0, padding: "0 10px" }}
            >
              <div className="flex gap-2.5">
                {/* Photo */}
                <div
                  style={{
                    width: "72px",
                    height: "90px",
                    flexShrink: 0,
                    borderRadius: "6px",
                    overflow: "hidden",
                    border: "2px solid #e2e8f0",
                    background: "#f1f5f9",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  {data.photoUrl ? (
                    <img
                      src={data.photoUrl}
                      alt="Member"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User style={{ width: "32px", height: "32px", color: "#94a3b8" }} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  {/* Name label + Name */}
                  <div
                    style={{
                      borderBottom: "1px solid #f0f0f0",
                      paddingBottom: "5px",
                      marginBottom: "5px",
                    }}
                  >
                    <div className="flex items-center gap-1" style={{ marginBottom: "2px" }}>
                      <User style={{ width: "8px", height: "8px", color: "#005B3A" }} />
                      <p
                        style={{
                          fontSize: "6px",
                          color: "#9ca3af",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {lang === "bn" ? "সদস্য নাম" : "Member Name"}
                      </p>
                    </div>
                    <h3
                      style={{
                        fontSize: "11.5px",
                        fontWeight: 800,
                        color: "#1a1a1a",
                        lineHeight: 1.2,
                      }}
                    >
                      {data.name}
                    </h3>
                  </div>

                  {/* Details grid */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "3.5px" }}>
                    {/* ID */}
                    <div className="flex items-center gap-1.5">
                      <CreditCard
                        style={{ width: "9px", height: "9px", color: "#005B3A", flexShrink: 0 }}
                      />
                      <span style={{ fontSize: "6.5px", color: "#6b7280", minWidth: "28px" }}>
                        {lang === "bn" ? "সদস্য ID" : "Member ID"}
                      </span>
                      <span style={{ fontSize: "7.5px", fontWeight: 700, color: "#1a1a1a" }}>
                        {memberCode}
                      </span>
                    </div>
                    {/* Phone */}
                    <div className="flex items-center gap-1.5">
                      <Phone
                        style={{ width: "9px", height: "9px", color: "#005B3A", flexShrink: 0 }}
                      />
                      <span style={{ fontSize: "6.5px", color: "#6b7280", minWidth: "28px" }}>
                        {lang === "bn" ? "মোবাইল" : "Mobile"}
                      </span>
                      <span style={{ fontSize: "7.5px", fontWeight: 700, color: "#1a1a1a" }}>
                        {data.phone || "—"}
                      </span>
                    </div>
                    {/* Type */}
                    <div className="flex items-center gap-1.5">
                      <Users
                        style={{ width: "9px", height: "9px", color: "#005B3A", flexShrink: 0 }}
                      />
                      <span style={{ fontSize: "6.5px", color: "#6b7280", minWidth: "28px" }}>
                        {lang === "bn" ? "সদস্য ধরন" : "Type"}
                      </span>
                      <span style={{ fontSize: "7.5px", fontWeight: 700, color: "#1a1a1a" }}>
                        {data.type}
                      </span>
                    </div>
                    {/* Blood */}
                    <div className="flex items-center gap-1.5">
                      <Droplet
                        style={{ width: "9px", height: "9px", color: "#ef4444", flexShrink: 0 }}
                      />
                      <span style={{ fontSize: "6.5px", color: "#6b7280", minWidth: "28px" }}>
                        {lang === "bn" ? "রক্তের গ্রুপ" : "Blood"}
                      </span>
                      <span style={{ fontSize: "7.5px", fontWeight: 700, color: "#1a1a1a" }}>
                        {data.bloodGroup || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── QR + Status Section ── */}
            <div
              className="absolute z-10"
              style={{
                bottom: "28px",
                left: 0,
                right: 0,
                padding: "0 10px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {/* QR Code */}
              <div
                style={{
                  padding: "4px",
                  background: "#fff",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "6px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  flexShrink: 0,
                }}
              >
                <QRCodeSVG
                  value={
                    data.qrToken
                      ? `${window.location.origin}/verify/${data.qrToken}`
                      : `ID:${data.id}`
                  }
                  size={52}
                  level="M"
                  fgColor="#005B3A"
                />
              </div>

              {/* Status + Validity */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
                {/* Active badge */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    background: isActive ? "rgba(0,91,58,0.08)" : "rgba(239,68,68,0.08)",
                    border: `1.5px solid ${isActive ? "rgba(0,91,58,0.25)" : "rgba(239,68,68,0.25)"}`,
                    borderRadius: "5px",
                    padding: "4px 6px",
                  }}
                >
                  <Shield
                    style={{
                      width: "13px",
                      height: "13px",
                      color: isActive ? "#005B3A" : "#ef4444",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <p
                      style={{
                        fontSize: "7px",
                        fontWeight: 800,
                        color: isActive ? "#005B3A" : "#ef4444",
                        textTransform: "uppercase",
                        lineHeight: 1,
                        letterSpacing: "0.5px",
                      }}
                    >
                      {isActive ? "ACTIVE MEMBER" : "INACTIVE"}
                    </p>
                    <p
                      style={{ fontSize: "6px", color: "#6b7280", lineHeight: 1, marginTop: "1px" }}
                    >
                      {lang === "bn" ? "সদস্য হিসেবে সক্রিয়" : "Active as Member"}
                    </p>
                  </div>
                </div>

                {/* Valid Thru */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "5px",
                    padding: "4px 6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "5.5px",
                      color: "#9ca3af",
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      lineHeight: 1,
                    }}
                  >
                    VALID THRU
                  </span>
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: 800,
                      color: "#1a1a1a",
                      lineHeight: 1,
                      marginTop: "2px",
                    }}
                  >
                    {formatExpiry(data.expiryDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Footer ── */}
            <div
              className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center"
              style={{
                height: "24px",
                background: "#005B3A",
                borderTop: "2px solid #D4AF37",
              }}
            >
              <p
                style={{
                  fontSize: "7px",
                  color: "rgba(255,255,255,0.9)",
                  letterSpacing: "2px",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {lang === "bn"
                  ? "সুশাসন  |  স্বচ্ছতা  |  সেবা  |  উন্নয়ন"
                  : "GOVERNANCE  |  TRANSPARENCY  |  SERVICE  |  DEV"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== BACK OF ID CARD ===================== */}
      {/* Professional frame wrapper */}
      <div
        style={{
          padding: "3px",
          borderRadius: "13px",
          background: "linear-gradient(145deg, #005B3A 0%, #D4AF37 50%, #005B3A 100%)",
          boxShadow: "0 4px 16px rgba(0,91,58,0.18), 0 1px 4px rgba(0,0,0,0.08)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: "2px",
            borderRadius: "11px",
            background: "linear-gradient(145deg, #fff9f0 0%, #ffffff 50%, #f0f7f4 100%)",
          }}
        >
          <div
            className="relative overflow-hidden bg-white print:break-after-avoid print:page-break-after-avoid print:m-0 print:mt-4"
            style={{
              width: "242px",
              height: "385px",
              minWidth: "242px",
              minHeight: "385px",
              borderRadius: "9px",
              boxShadow: "none",
              border: "none",
            }}
          >
            {/* Mosque silhouette watermark at bottom-right */}
            <div
              className="absolute pointer-events-none"
              style={{ bottom: "24px", right: 0, opacity: 0.08 }}
            >
              <MosqueSilhouette />
            </div>

            {/* ── Back Header ── */}
            <div
              className="absolute top-0 left-0 right-0 z-10 flex items-center gap-2.5"
              style={{
                background: "linear-gradient(135deg, #004d30 0%, #006B40 60%, #005B3A 100%)",
                height: "60px",
                padding: "0 12px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.12)",
                  border: "1.5px solid rgba(212,175,55,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <MosqueIcon size={24} color="#D4AF37" />
              </div>
              <div>
                <h4
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#ffffff",
                    lineHeight: 1.2,
                    marginBottom: "2px",
                  }}
                >
                  {lang === "bn" ? "আমাদের লক্ষ্য" : "Our Mission"}
                </h4>
                <p
                  style={{
                    fontSize: "6px",
                    color: "rgba(255,255,255,0.8)",
                    lineHeight: 1.35,
                    maxWidth: "155px",
                  }}
                >
                  {lang === "bn"
                    ? "সুশাসন, স্বচ্ছতা ও আধুনিক প্রযুক্তির মাধ্যমে মসজিদ ব্যবস্থাপনাকে সহজ ও জবাবদিহিমূলক করা"
                    : "Making mosque management easy and accountable through modern technology"}
                </p>
              </div>
            </div>

            {/* ── Benefits Section ── */}
            <div
              className="absolute z-10"
              style={{ top: "66px", left: 0, right: 0, padding: "0 10px" }}
            >
              <h5
                style={{
                  fontSize: "9.5px",
                  fontWeight: 800,
                  color: "#005B3A",
                  marginBottom: "6px",
                }}
              >
                {lang === "bn" ? "সদস্য সুবিধাসমূহ" : "Member Benefits"}
              </h5>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "4px",
                  marginBottom: "8px",
                }}
              >
                {[
                  {
                    icon: <User style={{ width: "11px", height: "11px" }} />,
                    label:
                      lang === "bn"
                        ? "মসজিদের অফিসিয়াল\nসদস্য পরিচয়"
                        : "Official Member\nIdentity",
                  },
                  {
                    icon: <Heart style={{ width: "11px", height: "11px" }} />,
                    label:
                      lang === "bn"
                        ? "অনুদান ও লেনদেন\nইতিহাস দেখার সুবিধা"
                        : "Donation &\nTransaction History",
                  },
                  {
                    icon: <Users style={{ width: "11px", height: "11px" }} />,
                    label: lang === "bn" ? "সভায় অংশগ্রহণের\nসুবিধা" : "Meeting\nParticipation",
                  },
                  {
                    icon: <QrCode style={{ width: "11px", height: "11px" }} />,
                    label: lang === "bn" ? "QR ভিত্তিক\nভেরিফিকেশন" : "QR Based\nVerification",
                  },
                  {
                    icon: <Bell style={{ width: "11px", height: "11px" }} />,
                    label:
                      lang === "bn" ? "ডিজিটাল নোটিশ\nও আপডেট গ্রহণ" : "Digital Notice\n& Updates",
                  },
                  {
                    icon: <FileText style={{ width: "11px", height: "11px" }} />,
                    label:
                      lang === "bn" ? "মসজিদ কার্যক্রমে\nঅংশগ্রহণের সুযোগ" : "Event\nParticipation",
                  },
                ].map((b, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "5px",
                      background: "#f8fafc",
                      border: "1px solid #e8f0ec",
                      borderRadius: "5px",
                      padding: "5px 5px",
                    }}
                  >
                    <div style={{ color: "#005B3A", flexShrink: 0, marginTop: "1px" }}>
                      {b.icon}
                    </div>
                    <p
                      style={{
                        fontSize: "6.5px",
                        fontWeight: 500,
                        color: "#374151",
                        lineHeight: 1.4,
                        whiteSpace: "pre-line",
                      }}
                    >
                      {b.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Warning box */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "6px",
                  background: "#fffbeb",
                  border: "1.5px solid #fcd34d",
                  borderRadius: "6px",
                  padding: "6px 7px",
                  marginBottom: "7px",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "4px",
                    background: "#f59e0b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <AlertTriangle style={{ width: "12px", height: "12px", color: "#fff" }} />
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "7.5px",
                      fontWeight: 800,
                      color: "#92400e",
                      marginBottom: "2px",
                    }}
                  >
                    {lang === "bn" ? "সতর্কীকরণ" : "Warning"}
                  </p>
                  <p style={{ fontSize: "6px", color: "#78350f", lineHeight: 1.45 }}>
                    {lang === "bn"
                      ? "এই কার্ডটি মসজিদের সম্পত্তি। হারিয়ে গেলে নিকটস্থ মসজিদ কর্তৃপক্ষকে অবহিত করুন। কার্ডটি অননুমোদিত ব্যক্তিকে প্রদান করবেন না।"
                      : "This card is property of the Mosque. If lost, notify the authority. Do not hand this card to unauthorized persons."}
                  </p>
                </div>
              </div>

              {/* Contact Section */}
              <div style={{ marginBottom: "4px" }}>
                <h6
                  style={{
                    fontSize: "9px",
                    fontWeight: 800,
                    color: "#005B3A",
                    marginBottom: "4px",
                  }}
                >
                  {lang === "bn" ? "যোগাযোগ" : "Contact"}
                </h6>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                  <div className="flex items-center gap-1.5">
                    <Phone style={{ width: "8px", height: "8px", color: "#005B3A" }} />
                    <span style={{ fontSize: "7px", color: "#374151" }}>01712-345678</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail style={{ width: "8px", height: "8px", color: "#005B3A" }} />
                    <span style={{ fontSize: "7px", color: "#374151" }}>info@mosque.com</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Globe style={{ width: "8px", height: "8px", color: "#005B3A" }} />
                    <span style={{ fontSize: "7px", color: "#374151" }}>
                      www.mosque-management.com
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Back Footer ── */}
            <div
              className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-1"
              style={{
                height: "24px",
                background: "#005B3A",
              }}
            >
              <Phone style={{ width: "8px", height: "8px", color: "rgba(255,255,255,0.85)" }} />
              <p style={{ fontSize: "6.5px", color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>
                {lang === "bn"
                  ? "জরুরি প্রয়োজনে যোগাযোগ করুন: 01712-345678"
                  : "Emergency Contact: 01712-345678"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

PrintableIdCard.displayName = "PrintableIdCard";
