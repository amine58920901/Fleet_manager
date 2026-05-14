import Link from "next/link"
import { ChevronLeft } from "lucide-react"

interface PageHeaderProps {
  title: string
  description?: string
  backHref?: string
  children?: React.ReactNode
}

export function PageHeader({ title, description, backHref, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        {backHref && (
          <Link href={backHref} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-1 transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Retour
          </Link>
        )}
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  )
}
