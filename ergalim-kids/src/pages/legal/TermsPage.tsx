import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Layout from '@/components/layout/Layout'

export default function TermsPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand-navy mb-8">
          <ArrowLeft size={16}/> Voltar à loja
        </Link>
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-black text-brand-navy mb-2">Termos de Uso</h1>
          <p className="text-gray-500 text-sm mb-8">Última atualização: Junho de 2026</p>

          <section className="mb-8">
            <h2 className="text-xl font-black text-brand-navy mb-3">1. Aceitação dos Termos</h2>
            <p className="text-gray-600">Ao utilizar o site <strong>ergalimkids.com</strong>, você concorda com estes Termos de Uso. Se não concordar, não utilize nossos serviços.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-black text-brand-navy mb-3">2. Cadastro</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Você deve ter pelo menos 18 anos ou ter autorização de um responsável</li>
              <li>As informações fornecidas devem ser verdadeiras e atualizadas</li>
              <li>Você é responsável pela segurança da sua conta e senha</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-black text-brand-navy mb-3">3. Pedidos e Pagamentos</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Os preços estão em Reais (R$) e incluem impostos</li>
              <li>O pedido é confirmado após a aprovação do pagamento</li>
              <li>Reservamos o direito de cancelar pedidos com suspeita de fraude</li>
              <li>Em caso de indisponibilidade de estoque, entraremos em contato</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-black text-brand-navy mb-3">4. Entrega</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Os prazos de entrega são estimados e podem variar</li>
              <li>Frete grátis para compras acima de R$ 299,00</li>
              <li>Não nos responsabilizamos por atrasos causados pelos Correios ou transportadoras</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-black text-brand-navy mb-3">5. Trocas e Devoluções</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Você tem 30 dias a partir do recebimento para solicitar troca ou devolução</li>
              <li>O produto deve estar em perfeitas condições, sem uso e com etiquetas</li>
              <li>Para solicitar: entre em contato pelo WhatsApp (21) 99211-0726</li>
              <li>O reembolso será processado em até 7 dias úteis após o recebimento da devolução</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-black text-brand-navy mb-3">6. Propriedade Intelectual</h2>
            <p className="text-gray-600">Todo o conteúdo do site (imagens, textos, logotipo) é propriedade da Ergalim Kids e não pode ser reproduzido sem autorização.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-brand-navy mb-3">7. Contato</h2>
            <p className="text-gray-600">
              📧 <a href="mailto:contato@ergalimkids.com" className="text-brand-pink">contato@ergalimkids.com</a><br/>
              💬 WhatsApp: (21) 99211-0726<br/>
              📍 Rua Dom João Braga, 236 - Alto da Serra, Petrópolis/RJ
            </p>
          </section>
        </div>
      </div>
    </Layout>
  )
}
