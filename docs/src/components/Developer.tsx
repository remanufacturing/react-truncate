import React from 'react'

export const Developer: React.FC<{
  avatar: string
  name: string
  homepage: string
}> = ({ avatar, name, homepage }) => {
  return (
    <a
      className="mb-2 mt-8 flex h-8 items-center gap-2 no-underline hover:underline"
      href={homepage}
      title={name}
      target="_blank"
      rel="noreferrer"
    >
      <div className="size-7 overflow-hidden rounded-full">
        <img className="size-full object-cover" src={avatar} alt={name} />
      </div>

      <span className="text-lg font-[600]">{name}</span>
    </a>
  )
}
