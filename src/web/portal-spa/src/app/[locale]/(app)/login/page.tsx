import Login from "@/app/[locale]/(app)/login/_components/Signin";

export default function LoginPage() {
  // Note: auto-redirect khi đã login đã tạm bỏ để dev preview UI.
  // Khi wire vào auth flow thật, khôi phục check session.isLoggedIn → redirect dashboard.
  return <Login />;
}
