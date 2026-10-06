import { APP_NAME } from './config'

export default function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 bg-neutral-50 text-neutral-900">
      <h1 className="text-4xl font-semibold tracking-tight">{APP_NAME}</h1>
      <p className="text-neutral-500">Phase 0 placeholder: deploy check.</p>
    </main>
  )
}
