const fs = require('fs');
const path = require('path');

console.log('🌍 MAPPING ACCEPTED COUNTRIES FROM AFFILIATE DATA\n');
console.log('==================================================');

// Read casinos data to extract country codes from affiliate campaigns
const casinosPath = path.join(__dirname, '..', 'data', 'casinos.json');
const casinosData = JSON.parse(fs.readFileSync(casinosPath, 'utf8'));

// Country code to full country name mapping
const countryMapping = {
    'UK': 'United Kingdom',
    'US': 'United States', 
    'CA': 'Canada',
    'AU': 'Australia',
    'NZ': 'New Zealand',
    'DE': 'Germany',
    'AT': 'Austria',
    'CH': 'Switzerland',
    'FR': 'France',
    'BE': 'Belgium',
    'NL': 'Netherlands',
    'ES': 'Spain',
    'IT': 'Italy',
    'PT': 'Portugal',
    'SE': 'Sweden',
    'NO': 'Norway',
    'DK': 'Denmark',
    'FI': 'Finland',
    'IE': 'Ireland',
    'GR': 'Greece',
    'PL': 'Poland',
    'CZ': 'Czech Republic',
    'SK': 'Slovakia',
    'HU': 'Hungary',
    'SI': 'Slovenia',
    'HR': 'Croatia',
    'BG': 'Bulgaria',
    'RO': 'Romania',
    'LT': 'Lithuania',
    'LV': 'Latvia',
    'EE': 'Estonia',
    'MT': 'Malta',
    'CY': 'Cyprus',
    'LU': 'Luxembourg',
    'IS': 'Iceland',
    'LI': 'Liechtenstein',
    'MC': 'Monaco',
    'AD': 'Andorra',
    'SM': 'San Marino',
    'VA': 'Vatican City',
    'UA': 'Ukraine',
    'BY': 'Belarus',
    'MD': 'Moldova',
    'RS': 'Serbia',
    'ME': 'Montenegro',
    'BA': 'Bosnia and Herzegovina',
    'MK': 'North Macedonia',
    'AL': 'Albania',
    'XK': 'Kosovo',
    'TR': 'Turkey',
    'RU': 'Russia',
    'JP': 'Japan',
    'KR': 'South Korea',
    'CN': 'China',
    'HK': 'Hong Kong',
    'TW': 'Taiwan',
    'SG': 'Singapore',
    'MY': 'Malaysia',
    'TH': 'Thailand',
    'VN': 'Vietnam',
    'PH': 'Philippines',
    'ID': 'Indonesia',
    'IN': 'India',
    'PK': 'Pakistan',
    'BD': 'Bangladesh',
    'LK': 'Sri Lanka',
    'NP': 'Nepal',
    'BT': 'Bhutan',
    'MV': 'Maldives',
    'AF': 'Afghanistan',
    'IR': 'Iran',
    'IQ': 'Iraq',
    'JO': 'Jordan',
    'LB': 'Lebanon',
    'SY': 'Syria',
    'IL': 'Israel',
    'PS': 'Palestine',
    'SA': 'Saudi Arabia',
    'AE': 'United Arab Emirates',
    'QA': 'Qatar',
    'BH': 'Bahrain',
    'KW': 'Kuwait',
    'OM': 'Oman',
    'YE': 'Yemen',
    'EG': 'Egypt',
    'LY': 'Libya',
    'TN': 'Tunisia',
    'DZ': 'Algeria',
    'MA': 'Morocco',
    'EH': 'Western Sahara',
    'MR': 'Mauritania',
    'ML': 'Mali',
    'BF': 'Burkina Faso',
    'NE': 'Niger',
    'TD': 'Chad',
    'SD': 'Sudan',
    'SS': 'South Sudan',
    'ER': 'Eritrea',
    'ET': 'Ethiopia',
    'DJ': 'Djibouti',
    'SO': 'Somalia',
    'KE': 'Kenya',
    'UG': 'Uganda',
    'TZ': 'Tanzania',
    'RW': 'Rwanda',
    'BI': 'Burundi',
    'MZ': 'Mozambique',
    'MW': 'Malawi',
    'ZM': 'Zambia',
    'ZW': 'Zimbabwe',
    'BW': 'Botswana',
    'NA': 'Namibia',
    'ZA': 'South Africa',
    'SZ': 'Eswatini',
    'LS': 'Lesotho',
    'MG': 'Madagascar',
    'MU': 'Mauritius',
    'SC': 'Seychelles',
    'KM': 'Comoros',
    'ST': 'São Tomé and Príncipe',
    'CV': 'Cape Verde',
    'SN': 'Senegal',
    'GM': 'Gambia',
    'GW': 'Guinea-Bissau',
    'GN': 'Guinea',
    'SL': 'Sierra Leone',
    'LR': 'Liberia',
    'CI': 'Ivory Coast',
    'GH': 'Ghana',
    'TG': 'Togo',
    'BJ': 'Benin',
    'NG': 'Nigeria',
    'CM': 'Cameroon',
    'CF': 'Central African Republic',
    'GQ': 'Equatorial Guinea',
    'GA': 'Gabon',
    'CG': 'Republic of the Congo',
    'CD': 'Democratic Republic of the Congo',
    'AO': 'Angola',
    'BR': 'Brazil',
    'AR': 'Argentina',
    'CL': 'Chile',
    'UY': 'Uruguay',
    'PY': 'Paraguay',
    'BO': 'Bolivia',
    'PE': 'Peru',
    'EC': 'Ecuador',
    'CO': 'Colombia',
    'VE': 'Venezuela',
    'GY': 'Guyana',
    'SR': 'Suriname',
    'GF': 'French Guiana',
    'MX': 'Mexico',
    'GT': 'Guatemala',
    'BZ': 'Belize',
    'SV': 'El Salvador',
    'HN': 'Honduras',
    'NI': 'Nicaragua',
    'CR': 'Costa Rica',
    'PA': 'Panama',
    'CU': 'Cuba',
    'JM': 'Jamaica',
    'HT': 'Haiti',
    'DO': 'Dominican Republic',
    'PR': 'Puerto Rico',
    'TT': 'Trinidad and Tobago',
    'BB': 'Barbados',
    'LC': 'Saint Lucia',
    'VC': 'Saint Vincent and the Grenadines',
    'GD': 'Grenada',
    'AG': 'Antigua and Barbuda',
    'KN': 'Saint Kitts and Nevis',
    'DM': 'Dominica',
    'BS': 'Bahamas',
    'BM': 'Bermuda',
    'TC': 'Turks and Caicos Islands',
    'KY': 'Cayman Islands',
    'VG': 'British Virgin Islands',
    'VI': 'U.S. Virgin Islands',
    'AI': 'Anguilla',
    'MS': 'Montserrat',
    'GP': 'Guadeloupe',
    'MQ': 'Martinique',
    'BL': 'Saint Barthélemy',
    'MF': 'Saint Martin',
    'SX': 'Sint Maarten',
    'CW': 'Curaçao',
    'AW': 'Aruba',
    'BQ': 'Caribbean Netherlands'
};

// Extract country codes from affiliate campaign names
const countryCodes = new Set();
const countryData = [];

console.log('📊 Extracting country codes from affiliate campaigns...\n');

casinosData.forEach(casino => {
    if (casino.affiliate && casino.affiliate.campaignName) {
        const campaignName = casino.affiliate.campaignName;
        
        // Extract country codes using regex (2-letter codes)
        const matches = campaignName.match(/\b[A-Z]{2}(?=\s|;|,|$|\])/g);
        
        if (matches) {
            matches.forEach(code => {
                if (countryMapping[code]) {
                    countryCodes.add(code);
                }
            });
        }
    }
});

// Convert to array and sort
const acceptedCountries = Array.from(countryCodes).sort();

console.log('🌍 ACCEPTED COUNTRIES FOUND:');
console.log('============================');

acceptedCountries.forEach((code, index) => {
    const countryName = countryMapping[code];
    const countryInfo = {
        code: code,
        name: countryName,
        slug: countryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        flag: `🌐`, // We'll add proper flags later
        region: getRegion(code),
        tier: getTier(code),
        currency: getCurrency(code),
        languages: getLanguages(code)
    };
    
    countryData.push(countryInfo);
    console.log(`${index + 1}. ${code} - ${countryName}`);
});

// Helper functions for country data enrichment
function getRegion(code) {
    const regions = {
        'Europe': ['UK', 'DE', 'AT', 'CH', 'FR', 'BE', 'NL', 'ES', 'IT', 'PT', 'SE', 'NO', 'DK', 'FI', 'IE', 'GR', 'PL', 'CZ', 'SK', 'HU', 'SI', 'HR', 'BG', 'RO', 'LT', 'LV', 'EE', 'MT', 'CY', 'LU', 'IS', 'UA'],
        'North America': ['US', 'CA', 'MX'],
        'Oceania': ['AU', 'NZ'],
        'Asia': ['JP', 'KR', 'CN', 'HK', 'SG'],
        'South America': ['BR', 'AR', 'CL'],
        'Middle East': ['AE', 'SA', 'IL'],
        'Africa': ['ZA', 'EG', 'MA']
    };
    
    for (const [region, codes] of Object.entries(regions)) {
        if (codes.includes(code)) return region;
    }
    return 'Other';
}

function getTier(code) {
    const tier1 = ['UK', 'US', 'CA', 'AU', 'DE', 'FR', 'NL', 'SE', 'NO', 'DK', 'CH', 'AT'];
    const tier2 = ['ES', 'IT', 'BE', 'IE', 'FI', 'NZ', 'PL', 'CZ', 'GR', 'PT'];
    
    if (tier1.includes(code)) return 'Tier 1';
    if (tier2.includes(code)) return 'Tier 2';
    return 'Tier 3';
}

function getCurrency(code) {
    const currencies = {
        'UK': 'GBP', 'US': 'USD', 'CA': 'CAD', 'AU': 'AUD', 'NZ': 'NZD',
        'DE': 'EUR', 'AT': 'EUR', 'CH': 'CHF', 'FR': 'EUR', 'BE': 'EUR',
        'NL': 'EUR', 'ES': 'EUR', 'IT': 'EUR', 'PT': 'EUR', 'IE': 'EUR',
        'FI': 'EUR', 'GR': 'EUR', 'LU': 'EUR', 'MT': 'EUR', 'CY': 'EUR',
        'EE': 'EUR', 'LV': 'EUR', 'LT': 'EUR', 'SI': 'EUR', 'SK': 'EUR',
        'SE': 'SEK', 'NO': 'NOK', 'DK': 'DKK', 'PL': 'PLN', 'CZ': 'CZK',
        'HU': 'HUF', 'HR': 'HRK', 'BG': 'BGN', 'RO': 'RON', 'IS': 'ISK',
        'UA': 'UAH', 'TR': 'TRY', 'RU': 'RUB', 'JP': 'JPY', 'KR': 'KRW',
        'CN': 'CNY', 'HK': 'HKD', 'SG': 'SGD', 'IN': 'INR', 'TH': 'THB',
        'MY': 'MYR', 'PH': 'PHP', 'ID': 'IDR', 'VN': 'VND', 'BR': 'BRL',
        'AR': 'ARS', 'MX': 'MXN', 'CL': 'CLP', 'ZA': 'ZAR', 'EG': 'EGP',
        'AE': 'AED', 'SA': 'SAR', 'IL': 'ILS', 'MA': 'MAD'
    };
    
    return currencies[code] || 'USD';
}

function getLanguages(code) {
    const languages = {
        'UK': ['English'],
        'US': ['English'],
        'CA': ['English', 'French'],
        'AU': ['English'],
        'NZ': ['English'],
        'DE': ['German'],
        'AT': ['German'],
        'CH': ['German', 'French', 'Italian'],
        'FR': ['French'],
        'BE': ['Dutch', 'French', 'German'],
        'NL': ['Dutch'],
        'ES': ['Spanish'],
        'IT': ['Italian'],
        'PT': ['Portuguese'],
        'SE': ['Swedish'],
        'NO': ['Norwegian'],
        'DK': ['Danish'],
        'FI': ['Finnish', 'Swedish'],
        'IE': ['English', 'Irish'],
        'GR': ['Greek'],
        'PL': ['Polish'],
        'CZ': ['Czech'],
        'SK': ['Slovak'],
        'HU': ['Hungarian'],
        'SI': ['Slovenian'],
        'HR': ['Croatian'],
        'BG': ['Bulgarian'],
        'RO': ['Romanian'],
        'LT': ['Lithuanian'],
        'LV': ['Latvian'],
        'EE': ['Estonian'],
        'MT': ['Maltese', 'English'],
        'CY': ['Greek', 'Turkish'],
        'LU': ['Luxembourgish', 'French', 'German'],
        'IS': ['Icelandic'],
        'UA': ['Ukrainian'],
        'TR': ['Turkish'],
        'RU': ['Russian'],
        'JP': ['Japanese'],
        'KR': ['Korean'],
        'CN': ['Chinese'],
        'HK': ['Chinese', 'English'],
        'SG': ['English', 'Chinese', 'Malay', 'Tamil'],
        'BR': ['Portuguese'],
        'AR': ['Spanish'],
        'MX': ['Spanish'],
        'CL': ['Spanish'],
        'ZA': ['Afrikaans', 'English'],
        'EG': ['Arabic'],
        'AE': ['Arabic'],
        'SA': ['Arabic'],
        'IL': ['Hebrew', 'Arabic'],
        'MA': ['Arabic', 'French']
    };
    
    return languages[code] || ['English'];
}

console.log(`\n📈 SUMMARY:`);
console.log(`===========`);
console.log(`Total accepted countries: ${acceptedCountries.length}`);

// Group by region
const byRegion = {};
countryData.forEach(country => {
    if (!byRegion[country.region]) byRegion[country.region] = [];
    byRegion[country.region].push(country);
});

console.log('\n🌍 BY REGION:');
Object.entries(byRegion).forEach(([region, countries]) => {
    console.log(`${region}: ${countries.length} countries`);
    countries.forEach(country => {
        console.log(`  - ${country.code}: ${country.name}`);
    });
});

// Save countries data
const countriesData = {
    metadata: {
        totalCountries: acceptedCountries.length,
        lastUpdated: new Date().toISOString(),
        regions: Object.keys(byRegion),
        extractedFrom: 'affiliate campaigns'
    },
    countries: countryData
};

const outputPath = path.join(__dirname, '..', 'data', 'countries.json');
fs.writeFileSync(outputPath, JSON.stringify(countriesData, null, 2));

console.log(`\n✅ Countries data saved to: data/countries.json`);
console.log('\n🎯 Ready for country pages creation!');