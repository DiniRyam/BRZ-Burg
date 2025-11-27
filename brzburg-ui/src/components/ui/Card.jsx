'use client'

import React from 'react';

export default function Card({
  imageUrl,
  title,
  description,
  onClick,
  className = "",
  children
}) {
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className={`
        rounded-lg border border-gray-200 bg-white p-0 shadow-sm transition-all text-left 
        hover:shadow-md hover:border-gray-300
        ${onClick ? 'cursor-pointer active:bg-gray-100' : ''}
        ${className}
      `}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          onClick();
        }
      }}
    >

      {/* imagem */}
      {imageUrl && (
        <div className="overflow-hidden rounded-t-lg">
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-32 object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <h3 className="font-sans text-base font-semibold text-gray-900">
          {title}
        </h3>

        {description && (
          <p className="mt-2 font-sans text-sm font-normal text-gray-500">
            {description}
          </p>
        )}

        {/* conteúdo extra (children) */}
        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </div>
    </Tag>
  )
}
