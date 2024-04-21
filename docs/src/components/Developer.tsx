import React from 'react'

export const Developer: React.FC<{
  avatar: string
  name: string
  homepage: string
}> = ({ avatar, name, homepage }) => {
  return (
    <a
      className="flex items-center gap-2 h-8 mt-8 mb-2 no-underline hover:underline"
      href={homepage}
      title={name}
      target="_blank"
      rel="noreferrer"
    >
      <div className="w-7 h-7 rounded-full overflow-hidden">
        <img className="w-full h-full object-fit" src={avatar} alt={name} />
      </div>

      <span className="text-lg font-600">{name}</span>
    </a>
  )
}
