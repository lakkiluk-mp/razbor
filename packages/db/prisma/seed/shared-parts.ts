import { PartCategory } from '@prisma/client'

export interface SharedPartDefinition {
  oemCode: string
  name: string
  category: PartCategory
  searchQueries: string[]
  usedBy: string[]
}

export const SHARED_PARTS_REGISTRY: SharedPartDefinition[] = [
  // ========================================
  // MAZDA ENGINES
  // ========================================
  {
    oemCode: 'L82902300',
    name: 'Двигатель 1.8 L8 (120 л.с.)',
    category: 'engine',
    searchQueries: ['oem:L82902300', 'двигатель 1.8 L8', 'мотор 1.8 L8', 'двигатель L8'],
    usedBy: ['mazda-6'],
  },
  {
    oemCode: 'LF1702300',
    name: 'Двигатель 2.0 LF (141-147 л.с.)',
    category: 'engine',
    searchQueries: ['oem:LF1702300', 'двигатель 2.0 LF', 'мотор 2.0 LF', 'двигатель LF'],
    usedBy: ['mazda-6', 'mazda-3', 'mazda-5'],
  },
  {
    oemCode: 'PEY502300',
    name: 'Двигатель 2.0 SKYACTIV-G (150 л.с.)',
    category: 'engine',
    searchQueries: [
      'oem:PEY502300',
      'двигатель 2.0 SKYACTIV-G',
      'мотор 2.0 SKYACTIV',
      'двигатель PE SKYACTIV',
    ],
    usedBy: ['mazda-6', 'mazda-3', 'mazda-cx-5'],
  },
  {
    oemCode: 'PYZC02300',
    name: 'Двигатель 2.5 SKYACTIV-G (192 л.с.)',
    category: 'engine',
    searchQueries: [
      'oem:PYZC02300',
      'двигатель 2.5 SKYACTIV-G',
      'мотор 2.5 SKYACTIV',
      'двигатель PY SKYACTIV',
    ],
    usedBy: ['mazda-6', 'mazda-cx-5', 'mazda-cx-9'],
  },
  {
    oemCode: 'PYZE02300',
    name: 'Двигатель 2.5T SKYACTIV-G Turbo (231 л.с.)',
    category: 'engine',
    searchQueries: [
      'oem:PYZE02300',
      'двигатель 2.5 турбо SKYACTIV',
      'мотор 2.5T SKYACTIV',
      'двигатель SKYACTIV-G Turbo',
    ],
    usedBy: ['mazda-6', 'mazda-cx-5', 'mazda-cx-9'],
  },

  // ========================================
  // MAZDA TRANSMISSIONS
  // ========================================
  {
    oemCode: 'G61117150',
    name: 'МКПП 5-ступ',
    category: 'transmission',
    searchQueries: ['oem:G61117150', 'мкпп 5 ступ мазда', 'коробка механика мазда'],
    usedBy: ['mazda-6', 'mazda-3'],
  },
  {
    oemCode: 'FS5AEL',
    name: 'АКПП 5-ступ FS5AEL/FNR5',
    category: 'transmission',
    searchQueries: [
      'oem:FS5AEL',
      'oem:FNR5',
      'акпп FS5AEL',
      'акпп FNR5',
      'акпп 5 ступ мазда',
      'коробка автомат мазда',
    ],
    usedBy: ['mazda-6', 'mazda-3', 'mazda-5'],
  },
  {
    oemCode: 'FW6AEL',
    name: 'АКПП 6-ступ',
    category: 'transmission',
    searchQueries: [
      'oem:FW6AEL',
      'акпп FW6AEL',
      'акпп 6 ступ мазда',
      'коробка автомат 6 ступ мазда',
    ],
    usedBy: ['mazda-6', 'mazda-3', 'mazda-cx-5'],
  },

  // ========================================
  // RENAULT ENGINES
  // ========================================
  {
    oemCode: '6001549085',
    name: 'Двигатель 1.4 K7J (75 л.с.)',
    category: 'engine',
    searchQueries: [
      'oem:6001549085',
      'двигатель 1.4 K7J',
      'мотор K7J',
      'двигатель K7J рено',
    ],
    usedBy: ['renault-logan'],
  },
  {
    oemCode: '8201109282',
    name: 'Двигатель 1.6 K7M (82 л.с.)',
    category: 'engine',
    searchQueries: [
      'oem:8201109282',
      'oem:100015193R',
      'двигатель 1.6 K7M',
      'мотор K7M',
      'двигатель K7M рено',
    ],
    usedBy: ['renault-logan', 'renault-sandero'],
  },
  {
    oemCode: '8201315743',
    name: 'Двигатель 1.6 K4M (102 л.с.)',
    category: 'engine',
    searchQueries: [
      'oem:8201315743',
      'oem:6001549002',
      'двигатель 1.6 K4M',
      'мотор K4M',
      'двигатель K4M рено',
    ],
    usedBy: ['renault-logan', 'renault-sandero', 'renault-duster'],
  },
  {
    oemCode: '8201583992',
    name: 'Двигатель 1.6 H4M (113 л.с.)',
    category: 'engine',
    searchQueries: [
      'oem:8201583992',
      'двигатель 1.6 H4M',
      'мотор H4M',
      'двигатель H4M рено',
      'двигатель HR16DE',
    ],
    usedBy: ['renault-logan', 'renault-sandero', 'renault-duster', 'lada-vesta', 'nissan-qashqai'],
  },

  // ========================================
  // NISSAN TRANSMISSIONS
  // ========================================
  {
    oemCode: 'JF015E',
    name: 'Вариатор (Jatco JF015E)',
    category: 'transmission',
    searchQueries: [
      'oem:JF015E',
      'oem:31020-3JX6A',
      'вариатор JF015E',
      'cvt JF015E',
      'вариатор Jatco JF015E',
    ],
    usedBy: ['lada-vesta', 'nissan-qashqai'],
  },

  // ========================================
  // RENAULT TRANSMISSIONS
  // ========================================
  {
    oemCode: '320100676R',
    name: 'МКПП 5-ступ Renault',
    category: 'transmission',
    searchQueries: [
      'oem:320100676R',
      'oem:320103500R',
      'oem:320103334R',
      'oem:320109037R',
      'мкпп 5 ступ рено',
      'коробка механика рено логан',
      'мкпп JH3 рено',
    ],
    usedBy: ['renault-logan', 'renault-sandero', 'renault-duster'],
  },
  {
    oemCode: '8201114873',
    name: 'АКПП 4-ступ Renault',
    category: 'transmission',
    searchQueries: [
      'oem:8201114873',
      'акпп 4 ступ рено',
      'коробка автомат рено логан',
      'акпп DP2 рено',
    ],
    usedBy: ['renault-logan', 'renault-duster'],
  },
  // ========================================
  // MERCEDES ENGINES
  // ========================================
  {
    oemCode: '111920',
    name: 'Двигатель 1.8 M111 (129 л.с.)',
    category: 'engine',
    searchQueries: ['oem:111920', 'oem:M111920', 'двигатель 1.8 M111', 'мотор M111'],
    usedBy: ['mercedes-c-class'],
  },
  {
    oemCode: '111945',
    name: 'Двигатель 2.0 M111 (136 л.с.)',
    category: 'engine',
    searchQueries: ['oem:111945', 'oem:M111945', 'двигатель 2.0 M111', 'мотор M111'],
    usedBy: ['mercedes-c-class'],
  },
  {
    oemCode: '112910',
    name: 'Двигатель 2.4 M112 V6 (170 л.с.)',
    category: 'engine',
    searchQueries: ['oem:112910', 'oem:M112910', 'двигатель 2.4 M112', 'мотор M112 V6 2.4'],
    usedBy: ['mercedes-c-class'],
  },
  {
    oemCode: '112912',
    name: 'Двигатель 2.6 M112 V6 (170 л.с.)',
    category: 'engine',
    searchQueries: ['oem:112912', 'oem:M112912', 'двигатель 2.6 M112', 'мотор M112 V6 2.6'],
    usedBy: ['mercedes-c-class'],
  },
  {
    oemCode: '112946',
    name: 'Двигатель 3.2 M112 V6 (218 л.с.)',
    category: 'engine',
    searchQueries: ['oem:112946', 'oem:M112946', 'двигатель 3.2 M112', 'мотор M112 3.2'],
    usedBy: ['mercedes-c-class'],
  },
  {
    oemCode: '271946',
    name: 'Двигатель 1.8 M271 (143 л.с.)',
    category: 'engine',
    searchQueries: ['oem:271946', 'oem:M271946', 'двигатель 1.8 M271', 'мотор M271 компрессор'],
    usedBy: ['mercedes-c-class'],
  },
  {
    oemCode: '271948',
    name: 'Двигатель 1.8 M271 (163 л.с.)',
    category: 'engine',
    searchQueries: ['oem:271948', 'oem:M271948', 'двигатель 1.8 M271', 'мотор M271 компрессор'],
    usedBy: ['mercedes-c-class'],
  },
  {
    oemCode: '271910',
    name: 'Двигатель 1.6 M271 (156 л.с.)',
    category: 'engine',
    searchQueries: ['oem:271910', 'oem:M271910', 'двигатель 1.6 M271', 'мотор M271'],
    usedBy: ['mercedes-c-class'],
  },
  {
    oemCode: '271820',
    name: 'Двигатель 1.8 M271 EVO (184 л.с.)',
    category: 'engine',
    searchQueries: ['oem:271820', 'oem:M271820', 'двигатель 1.8 M271 EVO', 'мотор M271 EVO'],
    usedBy: ['mercedes-c-class'],
  },
  {
    oemCode: '271860',
    name: 'Двигатель 1.8 M271 (204 л.с.)',
    category: 'engine',
    searchQueries: ['oem:271860', 'oem:M271860', 'двигатель 1.8 M271', 'мотор M271'],
    usedBy: ['mercedes-c-class'],
  },
  {
    oemCode: '272922',
    name: 'Двигатель 2.5 M272 V6 (204 л.с.)',
    category: 'engine',
    searchQueries: ['oem:272922', 'oem:M272922', 'двигатель 2.5 M272', 'мотор M272 V6'],
    usedBy: ['mercedes-c-class'],
  },
  {
    oemCode: '272947',
    name: 'Двигатель 3.0 M272 V6 (231 л.с.)',
    category: 'engine',
    searchQueries: ['oem:272947', 'oem:M272947', 'двигатель 3.0 M272', 'мотор M272 V6'],
    usedBy: ['mercedes-c-class'],
  },
  {
    oemCode: '272948',
    name: 'Двигатель 3.5 M272 V6 (272 л.с.)',
    category: 'engine',
    searchQueries: ['oem:272948', 'oem:M272948', 'двигатель 3.5 M272', 'мотор M272 V6'],
    usedBy: ['mercedes-c-class', 'mercedes-s-class'],
  },
  {
    oemCode: '274910',
    name: 'Двигатель 1.6 M274 (156 л.с.)',
    category: 'engine',
    searchQueries: ['oem:274910', 'oem:M274910', 'двигатель 1.6 M274', 'мотор M274'],
    usedBy: ['mercedes-c-class'],
  },
  {
    oemCode: '274920',
    name: 'Двигатель 2.0 M274 (184 л.с.)',
    category: 'engine',
    searchQueries: ['oem:274920', 'oem:M274920', 'двигатель 2.0 M274', 'мотор M274'],
    usedBy: ['mercedes-c-class'],
  },
  {
    oemCode: '264920',
    name: 'Двигатель 2.0 M264 (204-249 л.с.)',
    category: 'engine',
    searchQueries: ['oem:264920', 'oem:M264920', 'двигатель 2.0 M264', 'мотор M264'],
    usedBy: ['mercedes-c-class'],
  },
  {
    oemCode: '276823',
    name: 'Двигатель 3.0T M276 V6 (367 л.с.)',
    category: 'engine',
    searchQueries: ['oem:276823', 'oem:M276823', 'двигатель 3.0 M276 AMG', 'мотор M276 турбо'],
    usedBy: ['mercedes-c-class'],
  },
  {
    oemCode: '177980',
    name: 'Двигатель 4.0T M177 V8 (510 л.с.)',
    category: 'engine',
    searchQueries: ['oem:177980', 'oem:M177980', 'двигатель 4.0 M177 AMG', 'мотор M177 V8'],
    usedBy: ['mercedes-c-class'],
  },
  {
    oemCode: '156985',
    name: 'Двигатель 6.2 M156 V8 (457 л.с.)',
    category: 'engine',
    searchQueries: ['oem:156985', 'oem:M156985', 'двигатель 6.2 M156 AMG', 'мотор M156 V8'],
    usedBy: ['mercedes-c-class'],
  },
  {
    oemCode: '254915',
    name: 'Двигатель 1.5 M254 (204 л.с.)',
    category: 'engine',
    searchQueries: ['oem:254915', 'oem:M254915', 'двигатель 1.5 M254', 'мотор M254'],
    usedBy: ['mercedes-c-class'],
  },
  {
    oemCode: '254920',
    name: 'Двигатель 2.0 M254 (258 л.с.)',
    category: 'engine',
    searchQueries: ['oem:254920', 'oem:M254920', 'двигатель 2.0 M254', 'мотор M254'],
    usedBy: ['mercedes-c-class'],
  },

  // ========================================
  // MERCEDES S-CLASS ENGINES
  // ========================================
  {
    oemCode: '104944',
    name: 'Двигатель 2.8 M104 (193 л.с.)',
    category: 'engine',
    searchQueries: ['oem:104944', 'oem:M104944', 'двигатель 2.8 M104', 'мотор M104 2.8'],
    usedBy: ['mercedes-s-class'],
  },
  {
    oemCode: '104994',
    name: 'Двигатель 3.2 M104 (231 л.с.)',
    category: 'engine',
    searchQueries: ['oem:104994', 'oem:M104994', 'двигатель 3.2 M104', 'мотор M104 3.2'],
    usedBy: ['mercedes-s-class'],
  },
  {
    oemCode: '119971',
    name: 'Двигатель 4.2 M119 V8 (279 л.с.)',
    category: 'engine',
    searchQueries: ['oem:119971', 'oem:M119971', 'двигатель 4.2 M119', 'мотор M119 V8'],
    usedBy: ['mercedes-s-class'],
  },
  {
    oemCode: '119980',
    name: 'Двигатель 5.0 M119 V8 (320 л.с.)',
    category: 'engine',
    searchQueries: ['oem:119980', 'oem:M119980', 'двигатель 5.0 M119', 'мотор M119 V8'],
    usedBy: ['mercedes-s-class'],
  },
  {
    oemCode: '112944',
    name: 'Двигатель 3.2 M112 V6 (224 л.с.)',
    category: 'engine',
    searchQueries: ['oem:112944', 'oem:M112944', 'двигатель 3.2 M112', 'мотор M112 V6'],
    usedBy: ['mercedes-s-class'],
  },
  {
    oemCode: '112973',
    name: 'Двигатель 3.7 M112 V6 (245 л.с.)',
    category: 'engine',
    searchQueries: ['oem:112973', 'oem:M112973', 'двигатель 3.7 M112', 'мотор M112 V6 3.7'],
    usedBy: ['mercedes-s-class'],
  },
  {
    oemCode: '113941',
    name: 'Двигатель 4.3 M113 V8 (279 л.с.)',
    category: 'engine',
    searchQueries: ['oem:113941', 'oem:M113941', 'двигатель 4.3 M113', 'мотор M113 V8'],
    usedBy: ['mercedes-s-class'],
  },
  {
    oemCode: '113960',
    name: 'Двигатель 5.0 M113 V8 (306 л.с.)',
    category: 'engine',
    searchQueries: ['oem:113960', 'oem:M113960', 'двигатель 5.0 M113', 'мотор M113 V8'],
    usedBy: ['mercedes-s-class'],
  },
  {
    oemCode: '273923',
    name: 'Двигатель 4.7 M273 V8 (340 л.с.)',
    category: 'engine',
    searchQueries: ['oem:273923', 'oem:M273923', 'двигатель 4.7 M273', 'мотор M273 V8'],
    usedBy: ['mercedes-s-class'],
  },
  {
    oemCode: '273961',
    name: 'Двигатель 5.5 M273 V8 (388 л.с.)',
    category: 'engine',
    searchQueries: ['oem:273961', 'oem:M273961', 'двигатель 5.5 M273', 'мотор M273 V8'],
    usedBy: ['mercedes-s-class'],
  },
  {
    oemCode: '276957',
    name: 'Двигатель 3.5 M276 V6 (306 л.с.)',
    category: 'engine',
    searchQueries: ['oem:276957', 'oem:M276957', 'двигатель 3.5 M276', 'мотор M276 V6'],
    usedBy: ['mercedes-s-class'],
  },
  {
    oemCode: '278929',
    name: 'Двигатель 4.7 M278 V8 (435 л.с.)',
    category: 'engine',
    searchQueries: ['oem:278929', 'oem:M278929', 'двигатель 4.7 M278', 'мотор M278 V8 турбо'],
    usedBy: ['mercedes-s-class'],
  },

  // ========================================
  // MERCEDES TRANSMISSIONS
  // ========================================
  {
    oemCode: '722.6',
    name: 'АКПП 5-ступ Mercedes 722.6',
    category: 'transmission',
    searchQueries: ['oem:722.6', 'акпп 722.6 мерседес', 'акпп 5 ступ мерседес'],
    usedBy: ['mercedes-c-class', 'mercedes-s-class'],
  },
  {
    oemCode: '722.9',
    name: 'АКПП 7-ступ Mercedes 722.9',
    category: 'transmission',
    searchQueries: ['oem:722.9', 'акпп 722.9 мерседес', 'акпп 7 ступ мерседес 7G-Tronic'],
    usedBy: ['mercedes-c-class', 'mercedes-s-class'],
  },
  {
    oemCode: '725.0',
    name: 'АКПП 9-ступ Mercedes 725.0',
    category: 'transmission',
    searchQueries: ['oem:725.0', 'акпп 725.0 мерседес', 'акпп 9 ступ мерседес 9G-Tronic'],
    usedBy: ['mercedes-c-class'],
  },
  {
    oemCode: '716.6',
    name: 'МКПП 6-ступ Mercedes 716.6',
    category: 'transmission',
    searchQueries: ['oem:716.6', 'мкпп 716.6 мерседес', 'мкпп 6 ступ мерседес'],
    usedBy: ['mercedes-c-class'],
  },
  {
    oemCode: '716.5',
    name: 'МКПП 5-ступ Mercedes 716.5',
    category: 'transmission',
    searchQueries: ['oem:716.5', 'мкпп 716.5 мерседес', 'мкпп 5 ступ мерседес'],
    usedBy: ['mercedes-c-class'],
  },

  // ========================================
  // TOYOTA ENGINES
  // ========================================
  {
    oemCode: '1900028D00',
    name: 'Двигатель 2.4 2AZ-FE (167 л.с.)',
    category: 'engine',
    searchQueries: ['oem:1900028D00', 'двигатель 2.4 2AZ-FE', 'мотор 2AZ-FE', 'двигатель 2AZ'],
    usedBy: ['toyota-camry'],
  },
  {
    oemCode: '190000P090',
    name: 'Двигатель 3.5 2GR-FE V6 (277 л.с.)',
    category: 'engine',
    searchQueries: ['oem:190000P090', 'двигатель 3.5 2GR-FE', 'мотор 2GR-FE', 'двигатель 2GR V6'],
    usedBy: ['toyota-camry'],
  },
  {
    oemCode: '190000V010',
    name: 'Двигатель 2.5 2AR-FE (181 л.с.)',
    category: 'engine',
    searchQueries: ['oem:190000V010', 'двигатель 2.5 2AR-FE', 'мотор 2AR-FE', 'двигатель 2AR'],
    usedBy: ['toyota-camry'],
  },
  {
    oemCode: '190003Y280',
    name: 'Двигатель 2.0 M20A-FKS (150 л.с.)',
    category: 'engine',
    searchQueries: ['oem:190003Y280', 'двигатель 2.0 M20A-FKS', 'мотор M20A', 'двигатель M20A'],
    usedBy: ['toyota-camry'],
  },
  {
    oemCode: '19000F0010',
    name: 'Двигатель 2.5 A25A-FKS (200 л.с.)',
    category: 'engine',
    searchQueries: ['oem:19000F0010', 'двигатель 2.5 A25A-FKS', 'мотор A25A', 'двигатель A25A'],
    usedBy: ['toyota-camry'],
  },
  {
    oemCode: '190000P440',
    name: 'Двигатель 3.5 2GR-FKS V6 (249 л.с.)',
    category: 'engine',
    searchQueries: ['oem:190000P440', 'двигатель 3.5 2GR-FKS', 'мотор 2GR-FKS', 'двигатель 2GR-FKS V6'],
    usedBy: ['toyota-camry'],
  },

  // ========================================
  // TOYOTA TRANSMISSIONS
  // ========================================
  {
    oemCode: '3050033460',
    name: 'АКПП 5-ступ U250E',
    category: 'transmission',
    searchQueries: ['oem:3050033460', 'акпп U250E тойота', 'акпп 5 ступ тойота камри'],
    usedBy: ['toyota-camry'],
  },
  {
    oemCode: '3050033770',
    name: 'АКПП 6-ступ U760E',
    category: 'transmission',
    searchQueries: ['oem:3050033770', 'акпп U760E тойота', 'акпп 6 ступ тойота камри'],
    usedBy: ['toyota-camry'],
  },
  {
    oemCode: '3040012760',
    name: 'Direct Shift-CVT K120',
    category: 'transmission',
    searchQueries: ['oem:3040012760', 'вариатор K120 тойота', 'cvt K120 камри', 'Direct Shift CVT'],
    usedBy: ['toyota-camry'],
  },

  // ========================================
  // AUDI Q5 ENGINES — Petrol (8R)
  // ========================================
  {
    oemCode: '06H100031R',
    name: 'Двигатель 2.0 CDNB (180 л.с.)',
    category: 'engine',
    searchQueries: ['oem:06H100031R', 'двигатель 2.0 CDNB', 'мотор CDNB', 'двигатель CDNB ауди'],
    usedBy: ['audi-q5'],
  },
  {
    oemCode: '06H100035H',
    name: 'Двигатель 2.0 CDNC (211 л.с.)',
    category: 'engine',
    searchQueries: ['oem:06H100035H', 'двигатель 2.0 CDNC', 'мотор CDNC', 'двигатель CDNC ауди'],
    usedBy: ['audi-q5'],
  },
  {
    oemCode: '06L100032L',
    name: 'Двигатель 2.0 CNCD (225 л.с.)',
    category: 'engine',
    searchQueries: ['oem:06L100032L', 'двигатель 2.0 CNCD', 'мотор CNCD', 'двигатель CNCD ауди'],
    usedBy: ['audi-q5'],
  },
  {
    oemCode: 'CNCE',
    name: 'Двигатель 2.0 CNCE (230 л.с.)',
    category: 'engine',
    searchQueries: ['двигатель 2.0 CNCE', 'мотор CNCE', 'двигатель CNCE ауди'],
    usedBy: ['audi-q5'],
  },
  {
    oemCode: '06E100031L',
    name: 'Двигатель 3.2 CALB V6 (270 л.с.)',
    category: 'engine',
    searchQueries: ['oem:06E100031L', 'двигатель 3.2 CALB', 'мотор CALB', 'двигатель CALB V6'],
    usedBy: ['audi-q5'],
  },
  {
    oemCode: '06E100036A',
    name: 'Двигатель 3.0 CTUC V6 SC (272 л.с.)',
    category: 'engine',
    searchQueries: ['oem:06E100036A', 'двигатель 3.0 CTUC', 'мотор CTUC', 'двигатель CTUC компрессор'],
    usedBy: ['audi-q5'],
  },

  // ========================================
  // AUDI Q5 ENGINES — Diesel (8R)
  // ========================================
  {
    oemCode: '03L100036C',
    name: 'Двигатель 2.0d CAHA TDI (170 л.с.)',
    category: 'engine',
    searchQueries: ['oem:03L100036C', 'двигатель 2.0 CAHA', 'мотор CAHA', 'двигатель CAHA TDI'],
    usedBy: ['audi-q5'],
  },
  {
    oemCode: 'CGLC',
    name: 'Двигатель 2.0d CGLC TDI (177 л.с.)',
    category: 'engine',
    searchQueries: ['двигатель 2.0 CGLC', 'мотор CGLC', 'двигатель CGLC TDI'],
    usedBy: ['audi-q5'],
  },
  {
    oemCode: 'CCWA',
    name: 'Двигатель 3.0d CCWA TDI V6 (240 л.с.)',
    category: 'engine',
    searchQueries: ['двигатель 3.0 CCWA', 'мотор CCWA', 'двигатель CCWA TDI V6'],
    usedBy: ['audi-q5'],
  },
  {
    oemCode: 'CDUD',
    name: 'Двигатель 3.0d CDUD TDI V6 (245 л.с.)',
    category: 'engine',
    searchQueries: ['двигатель 3.0 CDUD', 'мотор CDUD', 'двигатель CDUD TDI V6'],
    usedBy: ['audi-q5'],
  },

  // ========================================
  // AUDI Q5 ENGINES — Petrol (FY)
  // ========================================
  {
    oemCode: '06L100032T',
    name: 'Двигатель 2.0 DAXB (249 л.с.)',
    category: 'engine',
    searchQueries: ['oem:06L100032T', 'двигатель 2.0 DAXB', 'мотор DAXB', 'двигатель DAXB ауди'],
    usedBy: ['audi-q5'],
  },

  // ========================================
  // AUDI Q5 ENGINES — Diesel (FY)
  // ========================================
  {
    oemCode: 'DETA',
    name: 'Двигатель 2.0d DETA TDI (190 л.с.)',
    category: 'engine',
    searchQueries: ['двигатель 2.0 DETA', 'мотор DETA', 'двигатель DETA TDI'],
    usedBy: ['audi-q5'],
  },
  // ========================================
  // AUDI Q5 TRANSMISSIONS
  // ========================================
  {
    oemCode: '0A6',
    name: 'МКПП 6-ступ (0A6)',
    category: 'transmission',
    searchQueries: ['oem:0A6', 'мкпп 6 ступ ауди', 'мкпп 0A6', 'коробка механика ауди q5'],
    usedBy: ['audi-q5'],
  },
  {
    oemCode: '0B5',
    name: 'S-tronic 7-ступ (DL501)',
    category: 'transmission',
    searchQueries: [
      'oem:0B5', 'oem:DL501',
      's-tronic DL501', 'робот DL501', 'dsg 7 ступ ауди',
      's tronic ауди q5', 'коробка 0B5',
    ],
    usedBy: ['audi-q5'],
  },
  {
    oemCode: '0BK',
    name: 'Tiptronic 8-ступ (ZF 8HP)',
    category: 'transmission',
    searchQueries: [
      'oem:0BK',
      'акпп 8 ступ ауди', 'tiptronic 8 ступ', 'zf 8hp ауди',
      'акпп 0BK', 'коробка автомат ауди q5',
    ],
    usedBy: ['audi-q5'],
  },
]

export function findSharedPart(oemCode: string): SharedPartDefinition | undefined {
  return SHARED_PARTS_REGISTRY.find((p) => p.oemCode === oemCode)
}

export function generateSharedPartSlug(def: SharedPartDefinition): string {
  return `shared-${def.category}-${def.oemCode.toLowerCase()}`
}
