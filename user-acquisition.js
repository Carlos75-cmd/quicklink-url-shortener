#!/usr/bin/env node

// Script de Adquisición de Usuarios para QuickLink
// Ejecutar con: node user-acquisition.js

class UserAcquisition {
  constructor() {
    this.appUrl = 'https://tu-dominio-vercel.vercel.app'; // Cambia por tu URL real
    this.targetAudiences = this.defineTargetAudiences();
  }

  defineTargetAudiences() {
    return [
      {
        name: 'Marketers Digitales',
        pain_points: ['Tracking de campañas', 'Links largos en redes sociales', 'Falta de analytics'],
        platforms: ['LinkedIn', 'Twitter', 'Marketing forums'],
        message: 'Optimiza tus campañas con analytics avanzados de links'
      },
      {
        name: 'Pequeños Negocios',
        pain_points: ['Presupuesto limitado', 'Links poco profesionales', 'Sin datos de clicks'],
        platforms: ['Facebook Groups', 'Local business forums'],
        message: 'Links profesionales que aumentan la confianza de tus clientes'
      },
      {
        name: 'Content Creators',
        pain_points: ['Links feos en bio', 'No saben qué contenido funciona', 'Múltiples plataformas'],
        platforms: ['YouTube', 'Instagram', 'TikTok'],
        message: 'Descubre qué contenido genera más clicks'
      },
      {
        name: 'Desarrolladores',
        pain_points: ['Necesitan API', 'Integración con herramientas', 'Datos técnicos'],
        platforms: ['GitHub', 'Stack Overflow', 'Dev.to'],
        message: 'API completa para integrar en tus proyectos'
      }
    ];
  }

  // 1. Generar mensajes personalizados por audiencia
  generateOutreachMessages() {
    console.log('📝 Generando mensajes de outreach...\n');
    
    this.targetAudiences.forEach((audience, index) => {
      console.log(`🎯 Audiencia ${index + 1}: ${audience.name}`);
      console.log(`Pain Points: ${audience.pain_points.join(', ')}`);
      console.log(`Plataformas: ${audience.platforms.join(', ')}`);
      
      const messages = this.createMessagesForAudience(audience);
      messages.forEach((msg, msgIndex) => {
        console.log(`\n📧 Mensaje ${msgIndex + 1}:`);
        console.log(msg);
      });
      console.log('\n' + '='.repeat(60) + '\n');
    });
  }

  createMessagesForAudience(audience) {
    const messages = [];
    
    // Mensaje para email/DM
    messages.push(`
Hola [NOMBRE],

Vi que trabajas en ${audience.name.toLowerCase()} y pensé que te podría interesar QuickLink.

Problema que resuelve: ${audience.pain_points[0]}

✅ ${audience.message}
✅ Analytics detallados de cada click
✅ Dominios personalizados
✅ Gratis para empezar (100 links/mes)

¿Te interesa probarlo? → ${this.appUrl}

Saludos,
[Tu nombre]
    `);

    // Mensaje para redes sociales
    messages.push(`
🚀 ¿Cansado de ${audience.pain_points[0].toLowerCase()}?

QuickLink te ayuda a:
• ${audience.message}
• Ver exactamente quién hace click
• Usar tu propio dominio
• Empezar gratis

Pruébalo: ${this.appUrl}

#${audience.name.replace(' ', '')} #URLShortener #Analytics
    `);

    return messages;
  }

  // 2. Lista de lugares específicos donde promocionar
  generatePromotionPlan() {
    console.log('🎯 Plan de Promoción Específico:\n');

    const promotionChannels = [
      {
        platform: 'Reddit',
        subreddits: [
          'r/Entrepreneur (900k miembros)',
          'r/smallbusiness (800k miembros)', 
          'r/marketing (200k miembros)',
          'r/SideProject (150k miembros)',
          'r/webdev (800k miembros)'
        ],
        strategy: 'Post: "Built a URL shortener with advanced analytics - feedback welcome"'
      },
      {
        platform: 'Facebook Groups',
        groups: [
          'Digital Marketing',
          'Small Business Owners',
          'Entrepreneurs Network',
          'Marketing Tools & Tips'
        ],
        strategy: 'Compartir como herramienta útil, no como promoción directa'
      },
      {
        platform: 'LinkedIn',
        approach: [
          'Buscar "Digital Marketing Manager" en tu ciudad',
          'Enviar conexión + mensaje personalizado',
          'Compartir en grupos de marketing',
          'Escribir post sobre "herramientas que uso"'
        ]
      },
      {
        platform: 'Product Hunt',
        plan: [
          '1. Preparar assets (logo, screenshots, descripción)',
          '2. Conseguir 10 amigos para votar temprano',
          '3. Lanzar un martes a las 12:01 AM PST',
          '4. Promocionar en redes durante el día'
        ]
      }
    ];

    promotionChannels.forEach(channel => {
      console.log(`📱 ${channel.platform}:`);
      if (channel.subreddits) {
        channel.subreddits.forEach(sub => console.log(`   • ${sub}`));
        console.log(`   Estrategia: ${channel.strategy}`);
      }
      if (channel.groups) {
        channel.groups.forEach(group => console.log(`   • ${group}`));
        console.log(`   Estrategia: ${channel.strategy}`);
      }
      if (channel.approach) {
        channel.approach.forEach(step => console.log(`   • ${step}`));
      }
      if (channel.plan) {
        channel.plan.forEach(step => console.log(`   • ${step}`));
      }
      console.log('');
    });
  }

  // 3. Script de seguimiento de métricas
  generateTrackingPlan() {
    console.log('📊 Plan de Seguimiento de Métricas:\n');

    const metrics = [
      {
        metric: 'Visitantes únicos/día',
        target: '50 en primera semana, 200 en primer mes',
        how_to_track: 'Google Analytics + logs del servidor'
      },
      {
        metric: 'Conversión Free → Pro',
        target: '2-5% (industria promedio)',
        how_to_track: 'PayPal dashboard + base de datos'
      },
      {
        metric: 'URLs acortadas/día',
        target: '100 en primera semana',
        how_to_track: 'Contador en base de datos'
      },
      {
        metric: 'Retención de usuarios',
        target: '30% regresa en 7 días',
        how_to_track: 'Analytics de usuarios recurrentes'
      }
    ];

    metrics.forEach(m => {
      console.log(`🎯 ${m.metric}`);
      console.log(`   Target: ${m.target}`);
      console.log(`   Cómo medir: ${m.how_to_track}\n`);
    });
  }

  // 4. Calendario de acciones diarias
  generateActionCalendar() {
    console.log('📅 Calendario de Acciones (Primeras 2 semanas):\n');

    const calendar = [
      { day: 'Día 1', actions: ['Lanzar en Product Hunt', 'Post en r/SideProject', 'Compartir en LinkedIn'] },
      { day: 'Día 2', actions: ['Enviar 10 DMs en LinkedIn', 'Post en Facebook groups', 'Responder comentarios'] },
      { day: 'Día 3', actions: ['Post en r/Entrepreneur', 'Enviar emails a contactos', 'Actualizar métricas'] },
      { day: 'Día 4', actions: ['Buscar menciones de competidores', 'Comentar en posts relevantes', 'A/B test landing'] },
      { day: 'Día 5', actions: ['Post en r/marketing', 'Crear contenido para blog', 'Analizar tráfico'] },
      { day: 'Día 6-7', actions: ['Descanso + análisis de resultados', 'Planear semana 2'] },
      { day: 'Semana 2', actions: ['Repetir mejores estrategias', 'Optimizar conversión', 'Buscar partnerships'] }
    ];

    calendar.forEach(item => {
      console.log(`📅 ${item.day}:`);
      item.actions.forEach(action => console.log(`   • ${action}`));
      console.log('');
    });
  }

  // Ejecutar todo
  run() {
    console.log('🚀 PLAN COMPLETO DE ADQUISICIÓN DE USUARIOS\n');
    console.log('=' * 60 + '\n');
    
    this.generateOutreachMessages();
    this.generatePromotionPlan();
    this.generateTrackingPlan();
    this.generateActionCalendar();
    
    console.log('✅ Plan generado completamente!');
    console.log('\n🎯 PRÓXIMOS PASOS INMEDIATOS:');
    console.log('1. Actualiza this.appUrl con tu URL real de Vercel');
    console.log('2. Empieza con Product Hunt (mayor impacto)');
    console.log('3. Ejecuta 2-3 acciones por día del calendario');
    console.log('4. Mide resultados semanalmente');
    console.log('5. Ajusta estrategia según lo que funcione mejor');
  }
}

// Ejecutar
const acquisition = new UserAcquisition();
acquisition.run();