'use client'

import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils' // (A mesma utilidade do v0 que o Card.js usa)

// buttonvariants usa a bibblioteca class variance authority
const buttonVariants = cva(

  // classes generica a todos os botoes 
  [
    'inline-flex',    // Layout
    'items-center',
    'justify-center',
    'rounded-md',     // kinas arredondados
    'px-4',           // padding horizontal
    'py-2',             // espaco vertical
    'transition-all', // animacao
    'font-semibold',  
    'text-base',
    'focus:outline-none', // resposta de clique
    'active:brightness-90', 
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
  ],
  {

    // as variacoes 
    variants: {
      variant: {

        // o botao verde do paz no complexo
        primary: [
          'bg-green-500',   
          'text-white',
          'hover:bg-green-600',
        ],
        // o botao cinza do nem la nem ca
        secondary: [
          'bg-gray-400',    
          'text-white',
          'hover:bg-gray-500',
        ],
        // o botao vermelho do deu ruim tropa
        danger: [
          'bg-red-500',     
          'text-white',
          'hover:bg-red-600',
        ],
      },
    },

    // variação geral se nenhuma for usada
    defaultVariants: {
      variant: 'primary',
    },
  }
)

//componentes do botao
const Button = React.forwardRef(
  ({ className, variant, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }