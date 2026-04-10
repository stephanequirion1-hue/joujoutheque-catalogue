require('dotenv').config();
const fs = require('fs');
const path = require('path');

const { TENANT_ID, CLIENT_ID, CLIENT_SECRET, DATAVERSE_URL } = process.env;

const CATEGORIE_MAP = {
  760800000: 'Développement physique',
  760800001: 'Développement cognitif',
  760800002: 'Développement mémoire',
  760800003: 'Développement motricité fine',
  760800004: 'Développement du langage',
  760800005: 'Développement social',
  760800006: 'Développement affectif',
};

async function getToken() {
  const url = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: `${DATAVERSE_URL}/.default`,
    grant_type: 'client_credentials',
  });

  const res = await fetch(url, { method: 'POST', body });
  const data = await res.json();
  if (!data.access_token) {
    throw new Error(`Auth failed: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

async function fetchInventaire(token) {
  const select = [
    'joujou_inventaireid',
    'joujou_identifiantjouet',
    'joujou_nom',
    'joujou_categoriedejeux',
    'joujou_contenudujouet',
    'joujou_etatdujouet',
    'joujou_photojeu_url',
    'joujou_datedecreation',
  ].join(',');

  const filter = 'statecode eq 0';
  let records = [];
  let url = `${DATAVERSE_URL}/api/data/v9.2/joujou_inventaires?$select=${select}&$filter=${filter}&$orderby=joujou_nom asc`;

  while (url) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        Prefer: 'odata.include-annotations=OData.Community.Display.V1.FormattedValue,odata.maxpagesize=1000',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Dataverse error ${res.status}: ${text}`);
    }

    const data = await res.json();
    records = records.concat(data.value);
    url = data['@odata.nextLink'] || null;
  }

  return records;
}

async function fetchMouvementsActifs(token) {
  const select = [
    'joujou_mouvementid',
    '_joujou_jouetemprunte_value',
    'joujou_datederetour',
    'joujou_datedelemprunt',
  ].join(',');

  // 760800001 = Emprunt (actif)
  const filter = "statecode eq 0 and joujou_etatdumouvement eq 760800001";
  let records = [];
  let url = `${DATAVERSE_URL}/api/data/v9.2/joujou_mouvements?$select=${select}&$filter=${filter}`;

  while (url) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        Prefer: 'odata.maxpagesize=1000',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Dataverse mouvements error ${res.status}: ${text}`);
    }

    const data = await res.json();
    records = records.concat(data.value);
    url = data['@odata.nextLink'] || null;
  }

  // Index par inventaire ID pour lookup rapide
  const map = {};
  for (const m of records) {
    const jouetId = m._joujou_jouetemprunte_value;
    if (jouetId) {
      map[jouetId] = {
        date_emprunt: m.joujou_datedelemprunt || null,
        date_retour: m.joujou_datederetour || null,
      };
    }
  }
  return map;
}

async function downloadPhoto(token, id) {
  const url = `${DATAVERSE_URL}/api/data/v9.2/joujou_inventaires(${id})/joujou_photojeu/$value?size=full`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 100) return null;

    const filename = `${id}.jpg`;
    const filepath = path.join(__dirname, '..', 'public', 'images', filename);
    fs.writeFileSync(filepath, buffer);
    return `images/${filename}`;
  } catch {
    return null;
  }
}

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#\d+;/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function mapRecord(record, photoPath, mouvement) {
  const etat = record.joujou_etatdujouet;
  const disponible = etat === null || etat === 760800000; // Retour = disponible

  const result = {
    id: record.joujou_identifiantjouet || null,
    nom: record.joujou_nom || '',
    categorie: CATEGORIE_MAP[record.joujou_categoriedejeux] || null,
    contenu: stripHtml(record.joujou_contenudujouet),
    disponible,
    photo: photoPath,
    date_acquisition: record.joujou_datedecreation ? record.joujou_datedecreation.split('T')[0] : null,
  };

  if (!disponible && mouvement) {
    result.date_retour_prevue = mouvement.date_retour ? mouvement.date_retour.split('T')[0] : null;
  }

  return result;
}

async function main() {
  console.log('Export du catalogue Joujouthèque...');
  console.log(`Dataverse: ${DATAVERSE_URL}`);

  const token = await getToken();
  console.log('Token obtenu.');

  const records = await fetchInventaire(token);
  console.log(`${records.length} jouets trouvés.`);

  const mouvements = await fetchMouvementsActifs(token);
  console.log(`${Object.keys(mouvements).length} emprunts actifs.`);

  // Prepare output directories
  const publicDir = path.join(__dirname, '..', 'public');
  const imagesDir = path.join(publicDir, 'images');
  fs.mkdirSync(imagesDir, { recursive: true });

  // Process records and download photos
  const jouets = [];
  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const hasPhoto = r.joujou_photojeu_url && r.joujou_photojeu_url.length > 0;
    let photoPath = null;

    if (hasPhoto) {
      photoPath = await downloadPhoto(token, r.joujou_inventaireid);
    }

    const mouvement = mouvements[r.joujou_inventaireid] || null;
    jouets.push(mapRecord(r, photoPath, mouvement));

    if ((i + 1) % 100 === 0) {
      console.log(`  ${i + 1}/${records.length} traités...`);
    }
  }

  const catalogue = {
    derniere_mise_a_jour: new Date().toISOString(),
    total: jouets.length,
    disponibles: jouets.filter((j) => j.disponible).length,
    jouets,
  };

  const outputPath = path.join(publicDir, 'catalogue.json');
  fs.writeFileSync(outputPath, JSON.stringify(catalogue, null, 2), 'utf-8');
  console.log(`Catalogue exporté: ${outputPath}`);
  console.log(`  Total: ${catalogue.total} | Disponibles: ${catalogue.disponibles}`);
}

main().catch((err) => {
  console.error('ERREUR:', err.message);
  process.exit(1);
});
