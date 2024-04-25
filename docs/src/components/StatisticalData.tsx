import React from 'react'
import pkg from '../../../package.json'

const name = pkg.name
const repoUrl = pkg.repository.url
const repo = repoUrl.replace('https://github.com/', '')
const color = '29c1e9'

const options = [
  {
    link: `https://www.npmjs.com/package/${name}`,
    image: `https://img.shields.io/npm/v/${name}?color=${color}&label=npm`,
    title: 'The latest version',
  },
  {
    link: `https://www.npmjs.com/package/${name}`,
    image: `https://img.shields.io/npm/dt/${name}?color=${color}&label=downloads`,
    title: 'Download counts',
  },
  {
    link: repoUrl,
    image: `https://img.shields.io/github/stars/${repo}?style=social`,
    title: 'GitHub stars',
  },
]

export const StatisticalData: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      {options.map((i) => {
        return (
          <a
            key={i.title}
            title={i.title}
            href={i.link}
            target="__blank"
            rel="sponsored nofollow noopener noreferrer"
          >
            <img alt={i.title} src={i.image} />
          </a>
        )
      })}
    </div>
  )
}
