const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    console.log('Tentative de récupération des articles WordPress');
    console.log('Détails de la requête:', {
      url: 'https://www.parking-actus.com/wp-json/wp/v2/posts?_embed=true&per_page=10',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Netlify Function / WordPress Posts Fetcher',
        'Referer': 'https://golden-gecko-c240a4.netlify.app'
      }
    });
    
    // Vérifier l'accessibilité publique de l'API
    const response = await fetch('https://www.parking-actus.com/wp-json/wp/v2/posts?_embed=true&per_page=10', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Netlify Function / WordPress Posts Fetcher',
        'Referer': 'https://golden-gecko-c240a4.netlify.app'
      }
    });
    
    console.log('Statut de la réponse:', response.status);
    console.log('En-têtes de la réponse:', Object.fromEntries(response.headers));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Contenu de l\'erreur:', errorText);
      console.error('En-têtes de la réponse:', Object.fromEntries(response.headers));
      
      // Tentative de récupérer plus d'informations sur l'erreur
      const errorDetails = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers),
        body: errorText
      };
      
      console.error('Détails complets de l\'erreur:', JSON.stringify(errorDetails, null, 2));
      
      throw new Error(`API WordPress a répondu avec: ${response.status} - ${errorText}`);
    }
    
    const wpPosts = await response.json();
    
    // Transformer les données pour Relevance AI
    const formattedData = wpPosts.map(post => ({
      id: post.id.toString(),
      title: post.title.rendered,
      content: post.content.rendered.replace(/<[^>]*>/g, ''), // Supprime les balises HTML
      excerpt: post.excerpt.rendered.replace(/<[^>]*>/g, ''),
      date: post.date,
      url: post.link,
      categories: post._embedded?.['wp:term']?.[0]?.map(cat => cat.name) || [],
      author: post._embedded?.['author']?.[0]?.name || '',
      featured_image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || ''
    }));
    
    // Retourner les données formatées
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // Permet à Relevance AI d'accéder
      },
      body: JSON.stringify({
        success: true,
        data: formattedData,
        count: formattedData.length
      })
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
        details: error.toString()
      })
    };
  }
};
