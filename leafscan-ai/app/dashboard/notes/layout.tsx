export default function NotesLayout({ children }: { children: React.ReactNode }) {
  // Notes page uses its own full-screen layout without AppShell
  return <>{children}</>
}
