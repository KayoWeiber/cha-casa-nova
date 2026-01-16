import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import Divider from './Divider'
import Button from './Button'

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { session } = useAuth()
  const navigate = useNavigate()

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev)

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      navigate('/login')
    } catch {
      // ignore
    }
  }

  const navItems = [
    { to: '/admin', label: 'Presentes', hint: 'CRUD' },
    { to: '/admin/reservas', label: 'Reservas', hint: 'Compras' },
    { to: '/admin/confirmacoes', label: 'Confirmações', hint: 'RSVP' },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar - fixed, full height, does NOT scroll with page */}
      <aside
        className={`
          fixed left-0 top-0 z-30 h-screen
          flex flex-col
          border-r border-black/10 bg-white/95 shadow-lg backdrop-blur
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'w-56' : 'w-16'}
        `}
      >
        {/* Toggle button inside sidebar */}
        <div className="flex items-center justify-between border-b border-black/10 p-3">
          {isSidebarOpen && (
            <div>
              <div className="text-xs uppercase tracking-wider opacity-60">Admin</div>
              <div className="text-base font-semibold leading-tight">Chá Casa Nova</div>
            </div>
          )}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? 'Fechar sidebar' : 'Abrir sidebar'}
            className="rounded-lg border border-black/10 bg-white p-2 hover:bg-gray-50 transition"
          >
            {isSidebarOpen ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>

        {/* Session info */}
        {isSidebarOpen && (
          <div className="border-b border-black/10 p-3">
            <div className="rounded-xl border border-black/10 bg-gray-50 p-3">
              <div className="text-xs opacity-60">Sessão</div>
              <div className="break-all text-sm font-medium">
                {session?.user?.email ?? 'Sessão ativa'}
              </div>
            </div>
          </div>
        )}

        {/* Navigation - scrollable if content overflows */}
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl border px-3 py-3 transition
                  ${isActive
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 bg-white/60 hover:bg-white'
                  }
                  ${!isSidebarOpen ? 'justify-center' : ''}
                  `
                }
              >
                {/* Icon placeholder */}
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-black/5 text-xs font-bold">
                  {item.label.charAt(0)}
                </span>
                {isSidebarOpen && (
                  <div className="flex-1">
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-xs opacity-60">{item.hint}</div>
                  </div>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-black/10">
          {isSidebarOpen ? (
            <>
              <Divider />
              <div className="mt-3">
                <Button onClick={handleLogout} variant="outline" className="w-full">
                  Sair
                </Button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sair"
              className="flex w-full items-center justify-center rounded-xl border border-black/10 bg-white p-3 hover:bg-gray-50 transition"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
              </svg>
            </button>
          )}
        </div>
      </aside>

      {/* Main content - scrollable, adjusts margin based on sidebar state */}
      <main
        className={`
          flex-1 h-screen overflow-y-auto p-6
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'ml-56' : 'ml-16'}
        `}
      >
        <Outlet />
      </main>
    </div>
  )
}
