import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const screenshotsDir = join(__dirname, '../screenshots');

async function takeScreenshots() {
  // 确保 screenshots 目录存在
  try {
    await fs.mkdir(screenshotsDir, { recursive: true });
  } catch (err) {
    console.error('Error creating screenshots directory:', err);
  }

  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: {
      width: 375,
      height: 667
    }
  });

  const page = await browser.newPage();
  
  try {
    // 访问首页
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000);

    // 1. 动态管理功能
    // 快速发布弹窗
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const publishButton = buttons.find(button => button.textContent.includes('发布'));
      if (publishButton) publishButton.click();
    });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: join(screenshotsDir, 'quick-publish.png'),
      fullPage: true
    });

    // 关闭发布弹窗（点击空白处）
    await page.evaluate(() => {
      const overlay = document.querySelector('.van-overlay');
      if (overlay) overlay.click();
    });
    await page.waitForTimeout(500);

    // 2. 互动功能
    // 点赞列表
    await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('.actions span'));
      const likeSpan = spans.find(span => span.textContent.includes('点赞'));
      if (likeSpan) likeSpan.click();
    });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: join(screenshotsDir, 'likes-list.png'),
      fullPage: true
    });

    // 关闭点赞列表（点击空白处）
    await page.evaluate(() => {
      const overlay = document.querySelector('.van-overlay');
      if (overlay) overlay.click();
    });
    await page.waitForTimeout(500);

    // 评论区
    await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('.actions span'));
      const commentSpan = spans.find(span => span.textContent.includes('评论'));
      if (commentSpan) commentSpan.click();
    });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: join(screenshotsDir, 'comments.png'),
      fullPage: true
    });

    // 3. 媒体处理
    // 图片预览
    const imageItems = await page.$$('.image-item');
    if (imageItems.length > 0) {
      await imageItems[0].click();
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: join(screenshotsDir, 'image-preview.png'),
        fullPage: true
      });

      // 关闭图片预览（点击空白处）
      await page.evaluate(() => {
        const overlay = document.querySelector('.van-overlay');
        if (overlay) overlay.click();
      });
      await page.waitForTimeout(500);
    }

    // 视频播放器
    const videos = await page.$$('video');
    if (videos.length > 0) {
      await videos[0].scrollIntoView();
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: join(screenshotsDir, 'video-player.png'),
        fullPage: true
      });
    }

    // 4. 用户体验
    // 下拉刷新
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.mouse.move(187, 200);
    await page.mouse.down();
    await page.mouse.move(187, 400, { steps: 10 });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: join(screenshotsDir, 'pull-refresh.png'),
      fullPage: true
    });
    await page.mouse.up();

    // 无限滚动
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: join(screenshotsDir, 'infinite-scroll.png'),
      fullPage: true
    });

    console.log('所有截图已完成！');
    console.log('截图保存在:', screenshotsDir);

  } catch (error) {
    console.error('截图过程中出错:', error);
  } finally {
    await browser.close();
  }
}

takeScreenshots();
