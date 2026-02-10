// types for problem reporting

export type ReportType = 'false-positive' | 'false-negative'

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
