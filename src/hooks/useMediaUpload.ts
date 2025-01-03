import { showToast } from 'vant'
import type { UploaderFileListItem, UploaderMaxSize } from 'vant'

export const useMediaUpload = () => {
  // 文件类型限制
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4']
  
  // 获取文件类型
  const getFileType = (file: File) => {
    // 从文件名获取后缀
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext === 'mp4') {
      return 'video'
    }
    return 'image'
  }
  
  // 文件大小限制（图片 10MB，视频 100MB）
  const maxSize = (file: File) => {
    if (file.type.startsWith('video/')) {
      return 100 * 1024 * 1024 // 视频 100MB
    }
    return 10 * 1024 * 1024 // 图片 10MB
  }
  
  // 上传前的校验
  const beforeRead = (file: File | File[]) => {
    const files = Array.isArray(file) ? file : [file]
    
    // 检查每个文件的类型和大小
    for (const f of files) {
      // 检查文件类型
      if (!allowedTypes.includes(f.type)) {
        showToast({
          message: '只能上传图片或视频文件',
          position: 'bottom',
          type: 'warning'
        })
        return false
      }
      
      // 检查文件大小
      const maxFileSize = maxSize(f)
      if (f.size > maxFileSize) {
        showToast({
          message: f.type.startsWith('video/') 
            ? '视频大小不能超过100MB' 
            : '图片大小不能超过10MB',
          position: 'bottom',
          type: 'warning'
        })
        return false
      }
    }
    
    return true
  }
  
  // 上传后的处理
  const afterRead = (file: UploaderFileListItem | UploaderFileListItem[]) => {
    const files = Array.isArray(file) ? file : [file]
    files.forEach(item => {
      if (item.file) {
        // 设置上传状态
        item.status = 'uploading'
        item.message = '上传中...'
        
        // 读取文件内容为 base64
        const reader = new FileReader()
        reader.onload = () => {
          const content = reader.result as string
          
          // 创建预览 URL 并设置类型
          const previewUrl = URL.createObjectURL(item.file!)
          item.url = previewUrl
          item.content = content // 保存 base64 内容
          
          // 根据文件后缀设置类型
          item.type = getFileType(item.file!)
          
          // 模拟上传过程
          setTimeout(() => {
            item.status = 'done'
            item.message = ''
            
            // 触发一个自定义事件通知上传完成
            window.dispatchEvent(new CustomEvent('mediaUploadComplete', {
              detail: { file: item }
            }))
          }, 1000)
        }
        
        reader.readAsDataURL(item.file)
      }
    })
  }
  
  return {
    beforeRead,
    afterRead
  }
}
