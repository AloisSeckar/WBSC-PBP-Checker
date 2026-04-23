// types for problem reporting

export type ReportType = 'not-error' | 'not-ok'

export type PBPReport = {
  gameLink: string
  reportType: ReportType
  issue: string
  description: string
}

export type PBPReportResponse = {
  success: boolean
  issueUrl?: string
  error?: string
}

export type GitHubErrorResponse = {
  response?: {
    status: number
    _data: unknown
  }
}
