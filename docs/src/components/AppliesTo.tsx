import React, { Fragment, useMemo } from 'react'
import pkg from '../../../package.json'
import { getTranslation, type Languages } from '@/i18n'

const repoUrl = pkg.repository.url

const supports = ['Truncate', 'ShowMore', 'MiddleTruncate'] as const

interface AppliesToProps {
  lang: Languages
  components: (typeof supports)[number][]
}

export const AppliesTo: React.FC<AppliesToProps> = ({
  lang,
  components = supports,
}) => {
  const title = getTranslation(lang, 'appliesTo.title')

  const componentsDisplay = supports.map((name) => {
    const checked = components.includes(name)
    if (!checked) return null
    return <span key={name}>{name} ✅</span>
  })

  return (
    <blockquote className="flex items-center gap-2 w-full mt-6">
      {title}
      <span className="flex items-center gap-3">{componentsDisplay}</span>
    </blockquote>
  )
}

const formatGitHubIssue = (url: string) => {
  const pattern = /github\.com\/([^\/]+\/[^\/]+)\/issues\/(\d+)/
  const match = url.match(pattern)

  if (match) {
    const [, repo, issueId] = match
    return `${repo}#${issueId}`
  }

  return null
}

interface IssueConfig {
  issueId: string
  href: string
}

const isIssueConfig = (v: unknown): v is IssueConfig => Boolean(v)

export const RelatedIssues: React.FC<{
  lang: Languages
  issues: (string | number)[]
}> = ({ lang, issues }) => {
  const title = getTranslation(lang, 'appliesTo.relatedIssues')

  const issuesDisplay = useMemo(() => {
    return issues
      .map((issue) => {
        const isIssueHref =
          typeof issue === 'string' && issue.startsWith('https://')
        const isIssueId = typeof issue === 'number'

        if (!isIssueHref && !isIssueId) return null

        const href = isIssueHref ? issue : `${repoUrl}/issues/${issue}`
        const issueId = isIssueId ? `#${issue}` : formatGitHubIssue(issue)

        if (!issueId) return null

        return {
          issueId,
          href,
        } satisfies IssueConfig
      })
      .filter(isIssueConfig)
      .map(({ issueId, href }, index) => {
        return (
          <Fragment key={href}>
            <a href={href} target="_blank" rel="noopener noreferrer">
              {issueId}
            </a>
            {index < issues.length - 1 && ', '}
          </Fragment>
        )
      })
  }, [issues])

  return (
    <blockquote className="flex items-center gap-2 w-full">
      {title}
      <span className="flex items-center gap-2">{issuesDisplay}</span>
    </blockquote>
  )
}
