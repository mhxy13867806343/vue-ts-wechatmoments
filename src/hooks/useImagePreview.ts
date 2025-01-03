import { showImagePreview, showToast } from 'vant'

export const useImagePreview = () => {
  const handleImagePreview = (images: string[], startPosition: number) => {
    showImagePreview({
      images: images,
      startPosition: startPosition,
      closeable: true,
      closeIconPosition: 'top-right',
      showIndex: true,
      maxZoom: 3,
      swipeDuration: 300,
      loop: true,
      onClose: () => {
        showToast({
          message: '已关闭预览',
          position: 'bottom'
        })
      },
      onChange: (index: number) => {
        console.log('当前图片索引:', index)
      }
    })
  }

  return {
    handleImagePreview
  }
}
