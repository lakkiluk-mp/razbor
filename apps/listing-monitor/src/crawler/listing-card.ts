import { DEMO_BASE_URL } from './search-urls.js'

export interface ListingCard {
  extId: string
  title: string
  price: number
  year: number | null
  url: string
  city: string
  imageUrl: string
  publishedAt: string
  sellerType: string
  mileage: number | null
  rawItem?: Record<string, unknown>
}

export const REGION_CITIES: Record<string, string[]> = {
  belgorodskaya_oblast: [
    'belgorod', 'staryy_oskol', 'gubkin', 'shebekino', 'novyy_oskol', 'valuyki',
    'alekseevka', 'borisovka', 'chernyanka', 'korocha', 'grayvoron', 'rakitnoe',
    'prohorovka', 'razumnoe', 'dubovoe', 'streletskoe', 'tomarovka', 'volokonovka',
    'veydelevka', 'ivnya', 'skorodnoe', 'biryuch', 'urazovo', 'ilovka', 'golovchino',
    'behteevka', 'stroitel', 'severnyy', 'yakovlevo', 'maslova_pristan',
    'marshala_zhukova', 'pyatnitskoe', 'bessonovka', 'gorodische', 'mayskiy', 'oktyabrskiy',
  ],
  voronezhskaya_oblast: [
    'voronezh', 'anna', 'bobrov', 'boguchar', 'borisoglebsk', 'buturlinovka', 'ertil',
    'gribanovskiy', 'hohol', 'kalach', 'kantemirovka', 'kashirskoe', 'kolodeznyy',
    'liski', 'nizhniy_kislyay', 'nizhniy_mamon', 'novaya_chigla', 'novaya_usman',
    'novohoperskiy', 'novovoronezh', 'olhovatka', 'ostrogozhsk', 'panino',
    'podgorenskiy', 'povorino', 'ramon', 'repevka', 'rogovatoe', 'rossosh', 'semiluki',
    'sredniy_ikorets', 'strelitsa', 'talovaya', 'ternovka', 'verhniy_mamon',
    'verhnyaya_hava', 'vorontsovka', 'volya', 'poroshkino',
  ],
  kurskaya_oblast: [
    'kursk', 'kurchatov', 'proletarskiy', 'zheleznogorsk', 'oboyan', 'sudzha',
    'shchigry', 'fatezh', 'dmitriev', 'tim', 'pristen', 'cheremisinovo', 'rylsk',
    'lgov', 'solntsevo', 'konyshevka', 'olymskiy', 'medvenka',
  ],
  lipetskaya_oblast: [
    'lipetsk', 'elets', 'gryazi', 'lebedyan', 'dankov', 'usman', 'chaplygin', 'zadonsk',
  ],
  tambovskaya_oblast: [
    'tambov', 'michurinsk', 'rasskazovo', 'morshansk', 'kotovsk', 'kirsanov', 'uvarovo',
  ],
  orlovskaya_oblast: [
    'orel', 'livny', 'mtsensk', 'bolhov', 'dmitrovsk',
  ],
  tulskaya_oblast: [
    'tula', 'novomoskovsk', 'uzlovaya', 'aleksin', 'efremov', 'shchekino', 'kimovsk',
    'suvorov', 'bogoroditsk', 'plavsk', 'yasnogorsk', 'venev',
  ],
  bryanskaya_oblast: [
    'bryansk', 'klintsy', 'novozybkov', 'dyatkovo', 'unecha', 'starodub', 'pochep',
    'karachev', 'seltso', 'zhukovka',
  ],
  rostovskaya_oblast: [
    'rostov_na_donu', 'taganrog', 'shakhty', 'novocherkassk', 'volgodonsk', 'bataysk',
    'azov', 'gukovo', 'donetsk', 'kamensk_shakhtinsky', 'novoshakhtinsk',
  ],
  krasnodarskiy_kray: [
    'krasnodar', 'sochi', 'novorossiysk', 'armavir', 'anapa', 'gelendzhik', 'tuapse',
    'krymsk', 'labinsk', 'slavyansk_na_kubani', 'timashevsk', 'belorechensk',
    'tikhoretsk', 'kushchevskaya', 'korenovsk',
  ],
}

const CITY_TO_REGION = new Map<string, string>()
for (const [region, cities] of Object.entries(REGION_CITIES)) {
  CITY_TO_REGION.set(region, region)
  for (const city of cities) {
    CITY_TO_REGION.set(city, region)
  }
}
for (const slug of ['moskva', 'tver', 'ryazan', 'penza', 'saratov', 'volgograd', 'vladimir', 'smolensk', 'kaluga', 'ivanovo', 'yaroslavl', 'samara', 'kazan', 'novosibirsk', 'ekaterinburg', 'sankt-peterburg']) {
  CITY_TO_REGION.set(slug, '_other')
}

export function isFromRegion(url: string, regionSlug: string): boolean {
  try {
    const path = new URL(url, DEMO_BASE_URL).pathname
    const slug = path.split('/')[1] || ''
    if (!slug) return true
    if (slug === regionSlug) return true
    const cityRegion = CITY_TO_REGION.get(slug)
    if (!cityRegion) return true
    return cityRegion === regionSlug
  } catch {
    return true
  }
}
