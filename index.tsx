import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ksm } from './stateManager';

// Configuración global de errores para KAIROS
const setupErrorHandling = () => {
  // Capturar errores globales de React
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    // Filtrar errores específicos de desarrollo de React
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') || args[0].includes('Error boundary'))
    ) {
      return;
    }
    originalConsoleError(...args);
    
    // Registrar errores críticos en el state manager
    if (args.join(' ').includes('Critical') || args.join(' ').includes('Uncaught')) {
      ksm.logActivity('SYSTEM', `🚨 Error crítico detectado: ${args.join(' ').substring(0, 100)}`, 'high');
    }
  };

  // Capturar errores no manejados
  window.addEventListener('error', (event) => {
    event.preventDefault();
    ksm.logActivity('SYSTEM', `⚠️ Error no manejado: ${event.message}`, 'high');
    console.error('Error no manejado:', event.error);
  });

  // Capturar promesas rechazadas no manejadas
  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    const reason = event.reason?.message || String(event.reason);
    ksm.logActivity('SYSTEM', `⚠️ Promesa rechazada: ${reason.substring(0, 100)}`, 'medium');
    console.error('Promesa rechazada no manejada:', event.reason);
  });

  console.log('🔧 KAIROS v8 - Sistema de manejo de errores inicializado');
};

// Configuración de desarrollo
const setupDevelopmentTools = () => {
  // Safe check for Vite environment
  const meta = (import.meta as any);
  const isDev = meta.env && meta.env.DEV;

  if (isDev) {
    // Exponer herramientas de desarrollo globalmente
    (window as any).ksm = ksm;
    
    // Hot Module Replacement
    const viteHot = meta.hot;
    if (viteHot) {
      viteHot.accept();
    }

    console.log('🔧 KAIROS v8 - Modo desarrollo activado');
    ksm.logActivity('DEV', '⚙️ Modo desarrollo activado', 'low');
  }
};

// Verificar requisitos del navegador
const checkBrowserCompatibility = (): boolean => {
  const requiredFeatures = [
    'Promise',
    'fetch',
    'localStorage',
    'sessionStorage',
    'customElements'
  ];

  const missingFeatures = requiredFeatures.filter(feature => !(feature in window));

  if (missingFeatures.length > 0) {
    console.error(`🚨 Navegador incompatible: Faltan características: ${missingFeatures.join(', ')}`);
    ksm.logActivity('SYSTEM', `🚨 Navegador incompatible: Faltan ${missingFeatures.length} características`, 'high');
    return false;
  }

  return true;
};

// Inicializar tema (claro/oscuro)
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('kairos-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Configurar listener para cambios de tema
  const themeToggle = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('kairos-theme', newTheme);
    ksm.logActivity('UI', `🌓 Tema cambiado a ${newTheme}`, 'low');
  };

  // Exponer toggle de tema globalmente (opcional, para desarrollo)
  (window as any).toggleKairosTheme = themeToggle;
};

// Función principal de inicialización
const initializeKairosApp = () => {
  console.log('🚀 Inicializando KAIROS v8...');
  ksm.logActivity('SYSTEM', '🚀 Inicializando KAIROS v8...', 'medium');

  // 1. Verificar compatibilidad
  if (!checkBrowserCompatibility()) {
    renderFallbackUI();
    return;
  }

  // 2. Configurar herramientas
  setupErrorHandling();
  setupDevelopmentTools();
  initializeTheme();

  // 3. Encontrar elemento raíz
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('❌ No se encontró el elemento raíz (#root)');
    ksm.logActivity('SYSTEM', '❌ Error crítico: No se encontró elemento raíz', 'high');
    document.body.innerHTML = `
      <div style="padding: 2rem; font-family: system-ui; text-align: center;">
        <h1 style="color: #ff4757;">Error Crítico KAIROS</h1>
        <p>No se pudo encontrar el elemento raíz (#root) en el DOM.</p>
        <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3742fa; color: white; border: none; border-radius: 4px;">
          Reintentar
        </button>
      </div>
    `;
    return;
  }

  // 4. Configurar estilos de carga inicial
  rootElement.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(135deg, #020617 0%, #070b14 100%);">
      <div style="text-align: center; color: white;">
        <div style="font-size: 2.5rem; margin-bottom: 1rem; font-weight: bold; letter-spacing: 0.2em;">
          ⚡ KAIROS v8
        </div>
        <div style="font-size: 1rem; opacity: 0.8; font-family: monospace;">
          INITIALIZING NEURAL SPORTS ANALYSIS SYSTEM...
        </div>
        <div style="margin-top: 2rem; width: 240px; height: 2px; background: rgba(0, 243, 255, 0.1); overflow: hidden; margin-left: auto; margin-right: auto;">
          <div id="loading-bar" style="height: 100%; background: #00f3ff; width: 30%; animation: pulse 1.5s ease-in-out infinite; box-shadow: 0 0 10px #00f3ff;"></div>
        </div>
      </div>
    </div>
  `;

  // 5. Crear raíz de React
  try {
    const root = ReactDOM.createRoot(rootElement);
    
    // Renderizar aplicación
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    console.log('✅ KAIROS v8 initialized successfully');
    ksm.logActivity('SYSTEM', '✅ KAIROS v8 application mounted correctly', 'low');

    // Remover loading screen después de un breve delay
    setTimeout(() => {
      const loadingScreen = document.getElementById('loading-bar')?.parentElement?.parentElement?.parentElement;
      if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 500ms ease-out';
        setTimeout(() => {
          if (loadingScreen.parentNode) {
            loadingScreen.parentNode.removeChild(loadingScreen);
          }
        }, 500);
      }
    }, 800);

  } catch (error) {
    console.error('❌ Error creating React root:', error);
    ksm.logActivity('SYSTEM', `❌ Critical React error: ${error instanceof Error ? error.message : 'Unknown'}`, 'high');
    renderFallbackUI();
  }
};

// UI de fallback para navegadores incompatibles o errores críticos
const renderFallbackUI = () => {
  const rootElement = document.getElementById('root') || document.body;
  
  rootElement.innerHTML = `
    <div style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 2rem;
      max-width: 600px;
      margin: 0 auto;
      color: #333;
    ">
      <div style="text-align: center; margin-bottom: 2rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">⚡</div>
        <h1 style="color: #3742fa; margin-bottom: 0.5rem;">KAIROS v8</h1>
        <p style="color: #666; margin-bottom: 2rem;">Neural Sports Analysis System</p>
      </div>
      
      <div style="
        background: #f8f9fa;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 2rem;
        border-left: 4px solid #ff4757;
      ">
        <h3 style="margin-top: 0; color: #ff4757;">⚠️ Initialization Error</h3>
        <p>Could not initialize KAIROS v8. This may be due to:</p>
        <ul style="padding-left: 1.5rem;">
          <li>Incompatible or outdated browser</li>
          <li>JavaScript blockers</li>
          <li>Connection issues with external services</li>
        </ul>
      </div>
      
      <div style="
        background: #f1f2f6;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 2rem;
      ">
        <h4 style="margin-top: 0;">🔄 Suggested Solutions:</h4>
        <ol style="padding-left: 1.5rem;">
          <li>Update your browser to the latest version</li>
          <li>Disable content blockers for this site</li>
          <li>Check your internet connection</li>
          <li>Clear browser cache and cookies</li>
          <li>Try in incognito mode</li>
        </ol>
      </div>
      
      <div style="display: flex; gap: 1rem; justify-content: center;">
        <button onclick="window.location.reload()" style="
          padding: 0.75rem 1.5rem;
          background: #3742fa;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        ">
          🔄 Reintentar
        </button>
        <button onclick="window.open('https://github.com/julioebriones/kairos/issues', '_blank')" style="
          padding: 0.75rem 1.5rem;
          background: transparent;
          color: #3742fa;
          border: 2px solid #3742fa;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        ">
          📋 Reportar problema
        </button>
      </div>
      
      <div style="margin-top: 2rem; text-align: center; color: #666; font-size: 0.9rem;">
        <p>KAIROS v8 • Neural Sports Analysis System</p>
        <p>© ${new Date().getFullYear()} • All rights reserved</p>
      </div>
    </div>
  `;
  
  // Agregar estilos CSS dinámicamente
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0% { transform: translateX(-100%); }
      50% { transform: translateX(200%); }
      100% { transform: translateX(200%); }
    }
  `;
  document.head.appendChild(style);
};

// Manejar eventos de conexión/desconexión
window.addEventListener('online', () => {
  ksm.logActivity('SYSTEM', '🌐 Internet connection restored', 'medium');
});

window.addEventListener('offline', () => {
  ksm.logActivity('SYSTEM', '⚠️ Internet connection lost', 'high');
});

// Manejar evento beforeunload para limpieza
window.addEventListener('beforeunload', () => {
  const meta = (import.meta as any);
  if (meta.env && meta.env.PROD) {
    ksm.logActivity('SYSTEM', '🔌 KAIROS application disconnected', 'low');
    localStorage.setItem('kairos_last_cleanup', new Date().toISOString());
  }
});

// Inicializar la aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeKairosApp);
} else {
  initializeKairosApp();
}

// Exportar para pruebas en desarrollo
const meta = (import.meta as any);
if (meta.env && meta.env.DEV) {
  (window as any).initializeKairosApp = initializeKairosApp;
  (window as any).renderFallbackUI = renderFallbackUI;
}
