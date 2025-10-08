import { test, expect } from '@playwright/test';

test.describe('Exercise Creation', () => {
  test('should login and create exercise', async ({ page }) => {
    // Логин
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'trainer@powerlift.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Ждем перенаправления на dashboard
    await page.waitForURL('**/dashboard');
    
    // Переходим на страницу тестирования сессии
    await page.goto('http://localhost:3000/test-session');
    
    // Получаем содержимое страницы
    const sessionInfo = await page.textContent('body');
    console.log('Session Info:', sessionInfo);
    
    // Переходим на страницу упражнений
    await page.goto('http://localhost:3000/exercises');
    
    // Открываем форму добавления
    await page.click('text=+ Добавить упражнение');
    
    // Заполняем форму
    await page.fill('input[type="text"]', 'Тестовое упражнение');
    
    // Отслеживаем сетевые запросы
    const responsePromise = page.waitForResponse(resp => 
      resp.url().includes('/api/exercises') && resp.request().method() === 'POST'
    );
    
    // Отправляем форму
    await page.click('button[type="submit"]');
    
    // Получаем ответ
    const response = await responsePromise;
    const responseData = await response.json();
    
    console.log('Response status:', response.status());
    console.log('Response data:', responseData);
    
    // Проверяем, что запрос успешен
    if (response.status() !== 201) {
      console.error('Failed to create exercise!');
      console.error('Response:', responseData);
    }
    
    expect(response.status()).toBe(201);
  });
});





