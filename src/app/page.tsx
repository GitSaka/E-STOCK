import { redirect } from "next/navigation";

export default function RootPage() {
  // Redirection automatique immédiate vers la page de connexion
  redirect("/login");
}
