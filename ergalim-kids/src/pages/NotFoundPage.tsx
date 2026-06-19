import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center"> <h1 className="font-black text-7xl text-brand-navy/10 -mt-6">404</h1> <h2 className="font-black text-3xl text-brand-navy -mt-2 mb-3">Página não encontrada! </h2> <p className="text-gray-500 font-bold mb-8 max-w-sm"> Essa página sumiu como roupa que sai de moda rápido! Mas tem muita coisa legal te esperando...
      </p> <div className="flex gap-4 flex-wrap justify-center"> <Link to="/" className="btn-navy"> Ir para o início</Link> <Link to="/shop" className="btn-primary"> Ver a loja</Link> </div> </div> )
}
