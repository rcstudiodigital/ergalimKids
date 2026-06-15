import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Layout from '@/components/layout/Layout'

export default function PrivacyPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand-navy mb-8">
          <ArrowLeft size={16}/> Voltar à loja
        </Link>
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-black text-brand-navy mb-2">Política de Privacidade</h1>
          <p className="text-gray-500 text-sm mb-8">Última atualização: Junho de 2026</p>

          <section className="mb-8">
            <h2 className="text-xl font-black text-brand-navy mb-3">1. Quem somos</h2>
            <p className="text-gray-600">A <strong>Ergalim Kids</strong> é uma loja de moda infantil localizada em Petrópolis/RJ. Nosso site é <strong>ergalimkids.com</strong>. Em caso de dúvidas sobre esta política, entre em contato: <a href="mailto:contato@ergalimkids.com" className="text-brand-pink">contato@ergalimkids.com</a>.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-black text-brand-navy mb-3">2. Quais dados coletamos</h2>
            <p className="text-gray-600 mb-3">Coletamos apenas os dados necessários para processar seus pedidos:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Dados de cadastro:</strong> nome, e-mail, telefone e senha (armazenada de forma segura)</li>
              <li><strong>Endereço de entrega:</strong> CEP, rua, número, bairro, cidade e estado</li>
              <li><strong>Dados do pedido:</strong> produtos comprados, valor e forma de pagamento</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-black text-brand-navy mb-3">3. Como usamos seus dados</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Processar e entregar seus pedidos</li>
              <li>Enviar confirmações de pedido por e-mail</li>
              <li>Enviar atualizações sobre o status da entrega</li>
              <li>Comunicar promoções e novidades (você pode cancelar a qualquer momento)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-black text-brand-navy mb-3">4. Compartilhamento de dados</h2>
            <p className="text-gray-600">Não vendemos seus dados a terceiros. Compartilhamos apenas com:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-3">
              <li><strong>Serviços de pagamento</strong> (Mercado Pago) para processar transações</li>
              <li><strong>Serviços de entrega</strong> (Correios, motoboy) para entregar seu pedido</li>
              <li><strong>Firebase/Google</strong> para armazenamento seguro dos dados</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-black text-brand-navy mb-3">5. Seus direitos (LGPD)</h2>
            <p className="text-gray-600">De acordo com a Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem direito a:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-3">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incorretos</li>
              <li>Solicitar a exclusão dos seus dados</li>
              <li>Revogar o consentimento para uso de dados</li>
            </ul>
            <p className="text-gray-600 mt-3">Para exercer esses direitos, entre em contato: <a href="mailto:contato@ergalimkids.com" className="text-brand-pink">contato@ergalimkids.com</a></p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-black text-brand-navy mb-3">6. Segurança</h2>
            <p className="text-gray-600">Utilizamos criptografia e medidas de segurança para proteger seus dados. Senhas são armazenadas de forma criptografada e nunca são compartilhadas.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-brand-navy mb-3">7. Contato</h2>
            <p className="text-gray-600">Dúvidas? Entre em contato:<br/>
            📧 <a href="mailto:contato@ergalimkids.com" className="text-brand-pink">contato@ergalimkids.com</a><br/>
            💬 WhatsApp: (21) 99211-0726<br/>
            📍 Rua Dom João Braga, 236 - Alto da Serra, Petrópolis/RJ</p>
          </section>
        </div>
      </div>
    </Layout>
  )
}
