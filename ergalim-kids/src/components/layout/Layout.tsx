import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header/>
      {/* pt: 48px (topbar) + 64px (navbar) = 112px */}
      <main className="flex-1 pt-[112px]">
        <Outlet/>
      </main>
      <Footer/>
    </div>
  )
}
