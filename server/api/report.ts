export default defineEventHandler(async (event): Promise<PBPReportResponse> => {
  const body = await readBody(event) as PBPReport

  // validate required fields
  if (!body.gameLink || !body.reportType || !body.issue || !body.description) {
    return {
      success: false,
      error: 'All fields are required.',
    }
  }

  // validate report type
  if (!['false-positive', 'false-negative'].includes(body.reportType)) {
    return {
      success: false,
      error: 'Invalid report type.',
    }
  }

  // validate game link format
  try {
    new URL(body.gameLink)
  } catch {
    return {
      success: false,
      error: 'Invalid game link URL.',
    }
  }

  const config = useRuntimeConfig()
  const githubToken = config.githubToken as string

  if (!githubToken) {
    console.error('GitHub token is not configured')
    return {
      success: false,
      error: 'Server configuration error. Please try again later.',
    }
  }

  // map report type to GitHub label
  const label = body.reportType === 'false-positive' ? 'false-positive' : 'false-negative'

  // build issue body
  const issueBody = `**Game link:** ${body.gameLink}\n\n**Report type:** ${body.reportType === 'false-positive' ? 'False positive' : 'False negative'}\n\n**Description:**\n${body.description}`

  try {
    const response = await $fetch<{ html_url: string }>('https://api.github.com/repos/AloisSeckar/WBSC-PBP-Checker/issues', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'wbsc-pbp-checker-bot',
      },
      body: {
        title: body.issue,
        body: issueBody,
        labels: [label],
      },
    })

    return {
      success: true,
      issueUrl: response.html_url,
    }
  } catch (error: unknown) {
    const status = (error as GitHubErrorResponse)?.response?.status
    const data = (error as GitHubErrorResponse)?.response?._data
    console.error('Failed to create GitHub issue:')
    console.log('status', status)
    console.log('data', data)
    return {
      success: false,
      error: `Failed to create GitHub issue: ${status} - ${data}`,
    }
  }
})
