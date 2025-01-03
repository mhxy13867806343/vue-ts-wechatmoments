export function formatDate(date: Date): string {
  // 使用 toLocaleDateString 和 toLocaleTimeString 来确保跨平台兼容性
  const dateStr = date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  
  const timeStr = date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  return `${dateStr} ${timeStr}`
}
