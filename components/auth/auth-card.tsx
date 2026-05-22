interface AuthCardProps {
  subtitle: string
  children: React.ReactNode
}

export function AuthCard({ subtitle, children }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">FleetManager</h1>
          <p className="text-gray-500 mt-1">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  )
}
