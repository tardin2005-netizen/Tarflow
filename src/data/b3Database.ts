export interface B3AssetData {
  code: string;
  name: string;
  price: number;
  category: "Ações" | "FIIs" | "Criptomoedas" | "ETFs" | "Outros";
  sector: string;
  pl?: number;
  pvp?: number;
  dy?: number;
  buyDecision?: "Sim" | "Não" | "Manter" | "Comprar" | "Aguardar";
}

export const B3_ASSET_DATABASE: Record<string, B3AssetData> = {
  // --- PETRÓLEO, GÁS E COMBUSTÍVEIS ---
  PETR4: { code: "PETR4", name: "Petrobras PN", price: 40.91, category: "Ações", sector: "Petróleo e Gás", pl: 4.90, pvp: 1.18, dy: 13.50, buyDecision: "Comprar" },
  PETR3: { code: "PETR3", name: "Petrobras ON", price: 42.15, category: "Ações", sector: "Petróleo e Gás", pl: 5.05, pvp: 1.21, dy: 13.20, buyDecision: "Comprar" },
  PRIO3: { code: "PRIO3", name: "PRIO (PetroRio)", price: 43.80, category: "Ações", sector: "Petróleo e Gás", pl: 7.20, pvp: 1.85, dy: 0.00, buyDecision: "Comprar" },
  BRAV3: { code: "BRAV3", name: "Brava Energia", price: 18.20, category: "Ações", sector: "Petróleo e Gás", pl: 6.40, pvp: 0.95, dy: 3.50, buyDecision: "Manter" },
  RECV3: { code: "RECV3", name: "PetroReconcavo", price: 19.10, category: "Ações", sector: "Petróleo e Gás", pl: 8.10, pvp: 1.35, dy: 9.80, buyDecision: "Comprar" },
  VBBR3: { code: "VBBR3", name: "Vibra Energia", price: 23.40, category: "Ações", sector: "Distribuição e Combustíveis", pl: 10.50, pvp: 1.70, dy: 5.20, buyDecision: "Manter" },
  UGPA3: { code: "UGPA3", name: "Ultrapar Participações", price: 24.10, category: "Ações", sector: "Distribuição e Combustíveis", pl: 11.20, pvp: 1.65, dy: 4.80, buyDecision: "Manter" },
  CSAN3: { code: "CSAN3", name: "Cosan S.A.", price: 12.80, category: "Ações", sector: "Energia e Açúcar", pl: 9.40, pvp: 1.10, dy: 4.10, buyDecision: "Manter" },
  RAIZ4: { code: "RAIZ4", name: "Raízen PN", price: 2.95, category: "Ações", sector: "Açúcar e Etanol", pl: 8.50, pvp: 0.85, dy: 6.20, buyDecision: "Aguardar" },

  // --- MINERAÇÃO, SIDERURGIA E METALURGIA ---
  VALE3: { code: "VALE3", name: "Vale S.A.", price: 68.40, category: "Ações", sector: "Mineração", pl: 6.20, pvp: 1.45, dy: 6.80, buyDecision: "Comprar" },
  CMIN3: { code: "CMIN3", name: "CSN Mineração", price: 5.80, category: "Ações", sector: "Mineração", pl: 7.10, pvp: 1.90, dy: 10.40, buyDecision: "Comprar" },
  GGBR4: { code: "GGBR4", name: "Gerdau PN", price: 18.90, category: "Ações", sector: "Siderurgia", pl: 6.80, pvp: 0.82, dy: 6.50, buyDecision: "Comprar" },
  GGBR3: { code: "GGBR3", name: "Gerdau ON", price: 16.40, category: "Ações", sector: "Siderurgia", pl: 6.50, pvp: 0.78, dy: 6.70, buyDecision: "Comprar" },
  GOAU4: { code: "GOAU4", name: "Metalúrgica Gerdau PN", price: 10.20, category: "Ações", sector: "Siderurgia", pl: 5.90, pvp: 0.75, dy: 7.20, buyDecision: "Comprar" },
  CSNA3: { code: "CSNA3", name: "CSN Siderúrgica", price: 11.50, category: "Ações", sector: "Siderurgia", pl: 8.90, pvp: 0.92, dy: 5.80, buyDecision: "Manter" },
  USIM5: { code: "USIM5", name: "Usiminas PNA", price: 6.20, category: "Ações", sector: "Siderurgia", pl: 12.40, pvp: 0.45, dy: 3.20, buyDecision: "Aguardar" },
  FESA4: { code: "FESA4", name: "Ferbasa PN", price: 8.95, category: "Ações", sector: "Metalurgia", pl: 7.80, pvp: 0.88, dy: 8.40, buyDecision: "Comprar" },
  UNIP6: { code: "UNIP6", name: "Unipar Carbocloro PNB", price: 52.30, category: "Ações", sector: "Química", pl: 8.90, pvp: 1.95, dy: 9.10, buyDecision: "Comprar" },
  BRKM5: { code: "BRKM5", name: "Braskem PNA", price: 17.40, category: "Ações", sector: "Petroquímica", pl: 0.00, pvp: 1.15, dy: 0.00, buyDecision: "Aguardar" },

  // --- SETOR FINANCEIRO & BANCOS ---
  BBAS3: { code: "BBAS3", name: "Banco do Brasil ON", price: 27.50, category: "Ações", sector: "Bancos", pl: 4.84, pvp: 0.78, dy: 10.20, buyDecision: "Comprar" },
  ITUB4: { code: "ITUB4", name: "Itaú Unibanco PN", price: 35.60, category: "Ações", sector: "Bancos", pl: 8.20, pvp: 1.65, dy: 7.80, buyDecision: "Comprar" },
  ITUB3: { code: "ITUB3", name: "Itaú Unibanco ON", price: 30.80, category: "Ações", sector: "Bancos", pl: 7.90, pvp: 1.55, dy: 7.40, buyDecision: "Comprar" },
  BBDC4: { code: "BBDC4", name: "Bradesco PN", price: 14.10, category: "Ações", sector: "Bancos", pl: 8.90, pvp: 0.90, dy: 6.90, buyDecision: "Comprar" },
  BBDC3: { code: "BBDC3", name: "Bradesco ON", price: 12.60, category: "Ações", sector: "Bancos", pl: 8.20, pvp: 0.85, dy: 7.10, buyDecision: "Comprar" },
  SANB11: { code: "SANB11", name: "Santander Brasil Unit", price: 28.30, category: "Ações", sector: "Bancos", pl: 9.40, pvp: 1.15, dy: 7.50, buyDecision: "Manter" },
  BPAC11: { code: "BPAC11", name: "BTG Pactual Unit", price: 34.80, category: "Ações", sector: "Bancos e Investimentos", pl: 11.80, pvp: 2.10, dy: 4.20, buyDecision: "Comprar" },
  BRSR6: { code: "BRSR6", name: "Banrisul PNB", price: 12.40, category: "Ações", sector: "Bancos", pl: 5.80, pvp: 0.52, dy: 9.80, buyDecision: "Comprar" },
  ABCB4: { code: "ABCB4", name: "Banco ABC Brasil PN", price: 23.50, category: "Ações", sector: "Bancos", pl: 6.20, pvp: 0.85, dy: 8.90, buyDecision: "Comprar" },
  B3SA3: { code: "B3SA3", name: "B3 S.A. Brasil Bolsa Balcão", price: 11.20, category: "Ações", sector: "Serviços Financeiros", pl: 12.80, pvp: 2.60, dy: 5.40, buyDecision: "Manter" },

  // --- SEGUROS & PREVIDÊNCIA ---
  BBSE3: { code: "BBSE3", name: "BB Seguridade ON", price: 35.18, category: "Ações", sector: "Seguros", pl: 7.43, pvp: 5.40, dy: 12.77, buyDecision: "Comprar" },
  CXSE3: { code: "CXSE3", name: "Caixa Seguridade ON", price: 14.80, category: "Ações", sector: "Seguros", pl: 8.50, pvp: 2.80, dy: 9.60, buyDecision: "Comprar" },
  PSSA3: { code: "PSSA3", name: "Porto Seguro ON", price: 36.40, category: "Ações", sector: "Seguros", pl: 8.90, pvp: 1.55, dy: 6.80, buyDecision: "Comprar" },
  IRBR3: { code: "IRBR3", name: "IRB Brasil RE ON", price: 42.10, category: "Ações", sector: "Resseguros", pl: 11.50, pvp: 0.95, dy: 2.80, buyDecision: "Manter" },
  WIZC3: { code: "WIZC3", name: "Wiz Co ON", price: 6.40, category: "Ações", sector: "Seguros e Corretagem", pl: 6.80, pvp: 1.20, dy: 9.40, buyDecision: "Comprar" },

  // --- ENERGIA ELÉTRICA & TRANSMISSÃO ---
  TAEE11: { code: "TAEE11", name: "Taesa Unit", price: 35.80, category: "Ações", sector: "Energia Elétrica", pl: 9.20, pvp: 1.70, dy: 10.80, buyDecision: "Comprar" },
  TRPL4: { code: "TRPL4", name: "ISA CTEEP (Transmissão Paulista) PN", price: 25.20, category: "Ações", sector: "Energia Elétrica", pl: 6.50, pvp: 0.95, dy: 9.50, buyDecision: "Comprar" },
  ALUP11: { code: "ALUP11", name: "Alupar Unit", price: 31.40, category: "Ações", sector: "Energia Elétrica", pl: 7.80, pvp: 1.15, dy: 7.90, buyDecision: "Comprar" },
  EGIE3: { code: "EGIE3", name: "Engie Brasil ON", price: 42.50, category: "Ações", sector: "Energia Elétrica", pl: 10.40, pvp: 3.20, dy: 7.60, buyDecision: "Comprar" },
  EQTL3: { code: "EQTL3", name: "Equatorial Energia ON", price: 32.10, category: "Ações", sector: "Energia Elétrica", pl: 11.80, pvp: 1.85, dy: 3.80, buyDecision: "Comprar" },
  CPFE3: { code: "CPFE3", name: "CPFL Energia ON", price: 34.60, category: "Ações", sector: "Energia Elétrica", pl: 8.20, pvp: 2.10, dy: 9.80, buyDecision: "Comprar" },
  CMIG4: { code: "CMIG4", name: "Cemig PN", price: 11.20, category: "Ações", sector: "Energia Elétrica", pl: 6.41, pvp: 1.07, dy: 11.72, buyDecision: "Comprar" },
  CPLE6: { code: "CPLE6", name: "Copel PNB", price: 9.80, category: "Ações", sector: "Energia Elétrica", pl: 8.50, pvp: 1.12, dy: 8.40, buyDecision: "Comprar" },
  ELET3: { code: "ELET3", name: "Eletrobras ON", price: 39.40, category: "Ações", sector: "Energia Elétrica", pl: 11.20, pvp: 0.85, dy: 3.20, buyDecision: "Manter" },
  ELET6: { code: "ELET6", name: "Eletrobras PNB", price: 43.80, category: "Ações", sector: "Energia Elétrica", pl: 11.50, pvp: 0.90, dy: 3.50, buyDecision: "Manter" },
  AURE3: { code: "AURE3", name: "Auren Energia ON", price: 10.60, category: "Ações", sector: "Energia Elétrica", pl: 9.80, pvp: 0.88, dy: 11.40, buyDecision: "Comprar" },
  ENEV3: { code: "ENEV3", name: "Eneva ON", price: 12.90, category: "Ações", sector: "Energia e Gás", pl: 13.50, pvp: 1.30, dy: 0.00, buyDecision: "Manter" },
  NEOE3: { code: "NEOE3", name: "Neoenergia ON", price: 19.80, category: "Ações", sector: "Energia Elétrica", pl: 6.20, pvp: 0.80, dy: 6.80, buyDecision: "Comprar" },

  // --- SANEAMENTO E UTILIDADES PÚBLICAS ---
  SBSP3: { code: "SBSP3", name: "Sabesp ON", price: 92.40, category: "Ações", sector: "Saneamento", pl: 14.50, pvp: 2.10, dy: 3.80, buyDecision: "Comprar" },
  SAPR11: { code: "SAPR11", name: "Sanepar Unit", price: 29.50, category: "Ações", sector: "Saneamento", pl: 5.60, pvp: 0.82, dy: 7.90, buyDecision: "Comprar" },
  SAPR4: { code: "SAPR4", name: "Sanepar PN", price: 5.85, category: "Ações", sector: "Saneamento", pl: 5.50, pvp: 0.80, dy: 8.10, buyDecision: "Comprar" },
  CSMG3: { code: "CSMG3", name: "Copasa ON", price: 21.80, category: "Ações", sector: "Saneamento", pl: 6.20, pvp: 0.88, dy: 8.60, buyDecision: "Comprar" },

  // --- BENS INDUSTRIAIS, MAQUINÁRIO E TRANSPORTE ---
  WEGE3: { code: "WEGE3", name: "Weg S.A. ON", price: 52.80, category: "Ações", sector: "Motores e Equipamentos", pl: 29.50, pvp: 8.90, dy: 1.90, buyDecision: "Comprar" },
  EMBR3: { code: "EMBR3", name: "Embraer ON", price: 56.40, category: "Ações", sector: "Aeronáutica e Defesa", pl: 18.20, pvp: 2.60, dy: 1.20, buyDecision: "Comprar" },
  RENT3: { code: "RENT3", name: "Localiza Rent a Car ON", price: 41.20, category: "Ações", sector: "Locação de Veículos", pl: 12.80, pvp: 1.55, dy: 4.80, buyDecision: "Comprar" },
  RAIL3: { code: "RAIL3", name: "Rumo Logística ON", price: 19.40, category: "Ações", sector: "Logística e Ferrovias", pl: 15.20, pvp: 1.80, dy: 2.10, buyDecision: "Manter" },
  CCRO3: { code: "CCRO3", name: "CCR S.A. ON", price: 12.60, category: "Ações", sector: "Rodovias e Concessões", pl: 9.80, pvp: 1.45, dy: 6.40, buyDecision: "Comprar" },
  TASA4: { code: "TASA4", name: "Taurus Armas PN", price: 11.80, category: "Ações", sector: "Armas e Defesa", pl: 7.20, pvp: 1.30, dy: 8.50, buyDecision: "Manter" },
  KEPL3: { code: "KEPL3", name: "Kepler Weber ON", price: 9.40, category: "Ações", sector: "Armazenagem e Agronegócio", pl: 7.50, pvp: 2.10, dy: 9.20, buyDecision: "Comprar" },
  POMO4: { code: "POMO4", name: "Marcopolo PN", price: 8.50, category: "Ações", sector: "Carrocerias e Ônibus", pl: 9.10, pvp: 2.20, dy: 5.40, buyDecision: "Comprar" },
  RAPT4: { code: "RAPT4", name: "Randoncorp PN", price: 11.20, category: "Ações", sector: "Autopeças e Implementos", pl: 8.20, pvp: 1.10, dy: 6.10, buyDecision: "Comprar" },

  // --- CONSUMO, VAREJO E ALIMENTAÇÃO ---
  ABEV3: { code: "ABEV3", name: "Ambev S.A. ON", price: 12.40, category: "Ações", sector: "Bebidas", pl: 12.90, pvp: 2.10, dy: 6.50, buyDecision: "Manter" },
  JBSS3: { code: "JBSS3", name: "JBS S.A. ON", price: 36.80, category: "Ações", sector: "Alimentos e Frigoríficos", pl: 9.40, pvp: 1.65, dy: 5.20, buyDecision: "Comprar" },
  BRFS3: { code: "BRFS3", name: "BRF S.A. ON", price: 24.50, category: "Ações", sector: "Alimentos e Aves", pl: 8.80, pvp: 2.10, dy: 3.40, buyDecision: "Comprar" },
  MRFG3: { code: "MRFG3", name: "Marfrig ON", price: 14.80, category: "Ações", sector: "Alimentos e Bovinos", pl: 7.20, pvp: 1.40, dy: 6.20, buyDecision: "Comprar" },
  BEEF3: { code: "BEEF3", name: "Minerva ON", price: 6.20, category: "Ações", sector: "Alimentos e Carnes", pl: 6.90, pvp: 1.85, dy: 8.90, buyDecision: "Comprar" },
  SMTO3: { code: "SMTO3", name: "São Martinho ON", price: 27.80, category: "Ações", sector: "Açúcar e Agronegócio", pl: 9.10, pvp: 1.45, dy: 6.10, buyDecision: "Comprar" },
  SLCE3: { code: "SLCE3", name: "SLC Agrícola ON", price: 18.20, category: "Ações", sector: "Grãos e Agronegócio", pl: 8.40, pvp: 1.15, dy: 7.20, buyDecision: "Comprar" },
  MDIA3: { code: "MDIA3", name: "M. Dias Branco ON", price: 29.40, category: "Ações", sector: "Massas e Biscoitos", pl: 10.20, pvp: 1.40, dy: 4.80, buyDecision: "Manter" },
  ASAI3: { code: "ASAI3", name: "Assaí Atacadista ON", price: 7.50, category: "Ações", sector: "Atacarejo e Alimentos", pl: 11.20, pvp: 2.40, dy: 3.10, buyDecision: "Manter" },
  CRFB3: { code: "CRFB3", name: "Carrefour Brasil ON", price: 8.10, category: "Ações", sector: "Supermercados", pl: 12.80, pvp: 0.95, dy: 4.20, buyDecision: "Manter" },
  GMAT3: { code: "GMAT3", name: "Grupo Mateus ON", price: 7.20, category: "Ações", sector: "Varejo Alimentar", pl: 9.80, pvp: 1.55, dy: 4.10, buyDecision: "Comprar" },
  MGLU3: { code: "MGLU3", name: "Magazine Luiza ON", price: 9.80, category: "Ações", sector: "E-commerce e Varejo", pl: 0.00, pvp: 1.10, dy: 0.00, buyDecision: "Aguardar" },
  LREN3: { code: "LREN3", name: "Lojas Renner ON", price: 17.50, category: "Ações", sector: "Vestuário e Varejo", pl: 13.40, pvp: 1.65, dy: 4.90, buyDecision: "Comprar" },
  AZZA3: { code: "AZZA3", name: "Azzas 2154 (Arezzo+Soma)", price: 42.80, category: "Ações", sector: "Calçados e Moda", pl: 12.10, pvp: 1.40, dy: 5.20, buyDecision: "Comprar" },
  VIVA3: { code: "VIVA3", name: "Vivara Participações ON", price: 23.40, category: "Ações", sector: "Joalheria e Luxo", pl: 13.50, pvp: 2.80, dy: 4.50, buyDecision: "Comprar" },
  NTCO3: { code: "NTCO3", name: "Natura &Co ON", price: 14.20, category: "Ações", sector: "Cosméticos e Higiene", pl: 14.80, pvp: 1.10, dy: 3.80, buyDecision: "Manter" },

  // --- SAÚDE E FARMÁCIA ---
  RADL3: { code: "RADL3", name: "Raia Drogasil ON", price: 28.20, category: "Ações", sector: "Farmácias", pl: 26.50, pvp: 6.20, dy: 1.80, buyDecision: "Comprar" },
  HAPV3: { code: "HAPV3", name: "Hapvida NotreDame ON", price: 3.40, category: "Ações", sector: "Planos de Saúde e Hospitais", pl: 14.20, pvp: 0.65, dy: 0.00, buyDecision: "Manter" },
  RDOR3: { code: "RDOR3", name: "Rede D'Or São Luiz ON", price: 29.80, category: "Ações", sector: "Hospitais", pl: 18.50, pvp: 2.40, dy: 3.20, buyDecision: "Comprar" },
  FLRY3: { code: "FLRY3", name: "Fleury S.A. ON", price: 15.60, category: "Ações", sector: "Medicina Diagnóstica", pl: 12.80, pvp: 1.55, dy: 6.50, buyDecision: "Comprar" },
  HYPE3: { code: "HYPE3", name: "Hypera Pharma ON", price: 26.90, category: "Ações", sector: "Farmacêutica", pl: 9.80, pvp: 1.50, dy: 7.20, buyDecision: "Comprar" },
  PGMN3: { code: "PGMN3", name: "Pague Menos ON", price: 2.85, category: "Ações", sector: "Farmácias", pl: 11.50, pvp: 0.70, dy: 4.10, buyDecision: "Manter" },

  // --- PAPEL, CELULOSE E EMBALAGENS ---
  SUZB3: { code: "SUZB3", name: "Suzano S.A. ON", price: 58.40, category: "Ações", sector: "Papel e Celulose", pl: 8.50, pvp: 1.70, dy: 4.80, buyDecision: "Comprar" },
  KLBN11: { code: "KLBN11", name: "Klabin Unit", price: 21.60, category: "Ações", sector: "Papel e Embalagens", pl: 8.20, pvp: 2.10, dy: 7.90, buyDecision: "Comprar" },
  KLBN4: { code: "KLBN4", name: "Klabin PN", price: 4.32, category: "Ações", sector: "Papel e Embalagens", pl: 8.10, pvp: 2.05, dy: 8.10, buyDecision: "Comprar" },
  RANI3: { code: "RANI3", name: "Irani Papel e Embalagem ON", price: 7.80, category: "Ações", sector: "Embalagens Sustentáveis", pl: 7.20, pvp: 1.65, dy: 9.40, buyDecision: "Comprar" },

  // --- TELECOMUNICAÇÕES E TECNOLOGIA ---
  VIVT3: { code: "VIVT3", name: "Telefônica Brasil (Vivo) ON", price: 54.20, category: "Ações", sector: "Telecomunicações", pl: 14.80, pvp: 1.30, dy: 7.80, buyDecision: "Comprar" },
  TIMS3: { code: "TIMS3", name: "TIM Brasil ON", price: 17.90, category: "Ações", sector: "Telecomunicações", pl: 13.90, pvp: 1.50, dy: 7.20, buyDecision: "Comprar" },
  TOTS3: { code: "TOTS3", name: "Totvs ON", price: 32.50, category: "Ações", sector: "Softwares de Gestão", pl: 24.20, pvp: 4.80, dy: 2.40, buyDecision: "Comprar" },
  POSI3: { code: "POSI3", name: "Positivo Tecnologia ON", price: 7.10, category: "Ações", sector: "Hardware e Tecnologia", pl: 8.40, pvp: 0.95, dy: 6.80, buyDecision: "Manter" },
  INTB3: { code: "INTB3", name: "Intelbras ON", price: 21.20, category: "Ações", sector: "Segurança e Comunicação", pl: 13.20, pvp: 2.80, dy: 4.90, buyDecision: "Comprar" },

  // --- CONSTRUÇÃO CIVIL E INCORPORAÇÃO ---
  CYRE3: { code: "CYRE3", name: "Cyrela Brazil Realty ON", price: 21.40, category: "Ações", sector: "Construção Civil", pl: 7.20, pvp: 1.05, dy: 8.90, buyDecision: "Comprar" },
  DIRR3: { code: "DIRR3", name: "Direcional Engenharia ON", price: 28.50, category: "Ações", sector: "Construção Civil", pl: 6.80, pvp: 1.85, dy: 11.20, buyDecision: "Comprar" },
  CURY3: { code: "CURY3", name: "Cury Construtora ON", price: 19.80, category: "Ações", sector: "Construção Civil", pl: 7.90, pvp: 3.10, dy: 9.80, buyDecision: "Comprar" },
  MRVE3: { code: "MRVE3", name: "MRV Engenharia ON", price: 7.40, category: "Ações", sector: "Construção Civil", pl: 11.50, pvp: 0.65, dy: 3.20, buyDecision: "Manter" },
  EZTC3: { code: "EZTC3", name: "Eztec ON", price: 14.80, category: "Ações", sector: "Construção Civil", pl: 8.90, pvp: 0.70, dy: 6.20, buyDecision: "Comprar" },
  ALOS3: { code: "ALOS3", name: "Allos (Aliansce Sonae) ON", price: 23.80, category: "Ações", sector: "Shopping Centers", pl: 11.20, pvp: 0.90, dy: 7.50, buyDecision: "Comprar" },
  MULT3: { code: "MULT3", name: "Multiplan ON", price: 26.40, category: "Ações", sector: "Shopping Centers", pl: 14.10, pvp: 1.80, dy: 5.80, buyDecision: "Comprar" },
  IGTI11: { code: "IGTI11", name: "Iguatemi Unit", price: 22.10, category: "Ações", sector: "Shopping Centers", pl: 13.80, pvp: 1.20, dy: 5.40, buyDecision: "Comprar" },

  // --- FUNDOS IMOBILIÁRIOS (FIIs) TOP B3 ---
  MXRF11: { code: "MXRF11", name: "Maxi Renda FII", price: 9.78, category: "FIIs", sector: "Papel e Híbrido", pl: 0, pvp: 1.02, dy: 12.45, buyDecision: "Comprar" },
  HGLG11: { code: "HGLG11", name: "CSHG Logística FII", price: 161.50, category: "FIIs", sector: "Galpões Logísticos", pl: 0, pvp: 0.98, dy: 8.90, buyDecision: "Comprar" },
  XPML11: { code: "XPML11", name: "XP Malls FII", price: 106.29, category: "FIIs", sector: "Shopping Centers", pl: 0, pvp: 0.96, dy: 10.39, buyDecision: "Comprar" },
  KNCR11: { code: "KNCR11", name: "Kinea Rendimentos Imobiliários FII", price: 104.20, category: "FIIs", sector: "Papel (CDI)", pl: 0, pvp: 1.01, dy: 13.80, buyDecision: "Comprar" },
  KNIP11: { code: "KNIP11", name: "Kinea Índices de Preços FII", price: 92.50, category: "FIIs", sector: "Papel (IPCA)", pl: 0, pvp: 0.95, dy: 11.50, buyDecision: "Comprar" },
  BTLG11: { code: "BTLG11", name: "BTG Pactual Logística FII", price: 101.40, category: "FIIs", sector: "Galpões Logísticos", pl: 0, pvp: 0.99, dy: 9.30, buyDecision: "Comprar" },
  VISC11: { code: "VISC11", name: "Vinci Shopping Centers FII", price: 114.20, category: "FIIs", sector: "Shopping Centers", pl: 0, pvp: 0.94, dy: 9.60, buyDecision: "Comprar" },
  VGHF11: { code: "VGHF11", name: "Valora Hedge Fund FII", price: 8.85, category: "FIIs", sector: "Híbrido e FoF", pl: 0, pvp: 0.93, dy: 13.20, buyDecision: "Comprar" },
  CPTS11: { code: "CPTS11", name: "Capitânia Securities FII", price: 7.62, category: "FIIs", sector: "Papel e CRIs", pl: 0, pvp: 0.86, dy: 13.99, buyDecision: "Manter" },
  XPLG11: { code: "XPLG11", name: "XP Log FII", price: 103.50, category: "FIIs", sector: "Galpões Logísticos", pl: 0, pvp: 0.93, dy: 9.10, buyDecision: "Comprar" },
  HGRU11: { code: "HGRU11", name: "CSHG Renda Urbana FII", price: 128.40, category: "FIIs", sector: "Renda Urbana", pl: 0, pvp: 1.01, dy: 9.80, buyDecision: "Comprar" },
  TGAR11: { code: "TGAR11", name: "TG Ativo Real FII", price: 118.50, category: "FIIs", sector: "Desenvolvimento", pl: 0, pvp: 0.96, dy: 14.50, buyDecision: "Comprar" },
  GARE11: { code: "GARE11", name: "Guardian Real Estate FII", price: 8.21, category: "FIIs", sector: "Logística e Renda Urbana", pl: 0, pvp: 0.87, dy: 12.13, buyDecision: "Comprar" },
  PSEC11: { code: "PSEC11", name: "Pátria Special Situations FII", price: 58.60, category: "FIIs", sector: "Crédito Imobiliário", pl: 0, pvp: 0.78, dy: 13.65, buyDecision: "Comprar" },
  ALZR11: { code: "ALZR11", name: "Alianza Trust Renda Imobiliária FII", price: 108.90, category: "FIIs", sector: "Lajes e Logística", pl: 0, pvp: 1.02, dy: 9.40, buyDecision: "Comprar" },
  TRXF11: { code: "TRXF11", name: "TRX Real Estate FII", price: 107.50, category: "FIIs", sector: "Imóveis Comerciais", pl: 0, pvp: 1.03, dy: 10.50, buyDecision: "Comprar" },
  VGIR11: { code: "VGIR11", name: "Valora RE III FII", price: 9.60, category: "FIIs", sector: "Papel (CDI)", pl: 0, pvp: 0.98, dy: 13.40, buyDecision: "Comprar" },
  PVBI11: { code: "PVBI11", name: "VBI Prime Properties FII", price: 95.80, category: "FIIs", sector: "Lajes Corporativas AAA", pl: 0, pvp: 0.88, dy: 8.40, buyDecision: "Comprar" },
  JSRE11: { code: "JSRE11", name: "JS Real Estate FII", price: 68.20, category: "FIIs", sector: "Lajes Corporativas", pl: 0, pvp: 0.65, dy: 9.80, buyDecision: "Comprar" },
  SNAG11: { code: "SNAG11", name: "Suno Agro Fiagro", price: 9.95, category: "FIIs", sector: "Fiagro (Agronegócio)", pl: 0, pvp: 0.99, dy: 13.10, buyDecision: "Comprar" },
  KNCA11: { code: "KNCA11", name: "Kinea Crédito Agro Fiagro", price: 102.30, category: "FIIs", sector: "Fiagro (Agronegócio)", pl: 0, pvp: 1.01, dy: 13.60, buyDecision: "Comprar" },

  // --- ETFS B3 ---
  BOVA11: { code: "BOVA11", name: "iShares Ibovespa ETF", price: 128.50, category: "ETFs", sector: "Índice B3", dy: 0, buyDecision: "Comprar" },
  SMAL11: { code: "SMAL11", name: "iShares Small Cap ETF", price: 98.40, category: "ETFs", sector: "Small Caps Brasil", dy: 0, buyDecision: "Comprar" },
  IVVB11: { code: "IVVB11", name: "iShares S&P 500 ETF Brasil", price: 345.00, category: "ETFs", sector: "S&P 500 (EUA em Reais)", dy: 0, buyDecision: "Comprar" },
  HASH11: { code: "HASH11", name: "Hashdex Nasdaq Crypto ETF", price: 54.80, category: "ETFs", sector: "Criptoativos", dy: 0, buyDecision: "Comprar" },
  NASD11: { code: "NASD11", name: "Trend ETF Nasdaq 100", price: 21.40, category: "ETFs", sector: "Tecnologia Global", dy: 0, buyDecision: "Comprar" },
  GOLD11: { code: "GOLD11", name: "Trend ETF Ouro", price: 14.80, category: "ETFs", sector: "Commodities / Ouro", dy: 0, buyDecision: "Comprar" },
  DIVO11: { code: "DIVO11", name: "It Now IDIV Dividendos ETF", price: 94.50, category: "ETFs", sector: "Ações de Dividendos", dy: 0, buyDecision: "Comprar" },

  // --- BDRS GLOBAIS NEGOCIADOS NA B3 ---
  AAPL34: { code: "AAPL34", name: "Apple Inc. BDR", price: 68.90, category: "Outros", sector: "Tecnologia Global", dy: 0.60, buyDecision: "Comprar" },
  MSFT34: { code: "MSFT34", name: "Microsoft Corp BDR", price: 96.50, category: "Outros", sector: "Tecnologia e Cloud", dy: 0.80, buyDecision: "Comprar" },
  NVDC34: { code: "NVDC34", name: "NVIDIA Corp BDR", price: 148.00, category: "Outros", sector: "Inteligência Artificial e Semicondutores", dy: 0.10, buyDecision: "Comprar" },
  AMZO34: { code: "AMZO34", name: "Amazon.com Inc BDR", price: 58.40, category: "Outros", sector: "E-commerce e Cloud", dy: 0.00, buyDecision: "Comprar" },
  GOOGL34: { code: "GOOGL34", name: "Alphabet (Google) Class A BDR", price: 69.20, category: "Outros", sector: "Tecnologia e Mídia", dy: 0.50, buyDecision: "Comprar" },
  TSLA34: { code: "TSLA34", name: "Tesla Inc BDR", price: 89.50, category: "Outros", sector: "Veículos Elétricos e IA", dy: 0.00, buyDecision: "Manter" },
  META34: { code: "META34", name: "Meta Platforms (Facebook) BDR", price: 122.00, category: "Outros", sector: "Redes Sociais e IA", dy: 0.40, buyDecision: "Comprar" },
  MELI34: { code: "MELI34", name: "MercadoLibre Inc BDR", price: 112.50, category: "Outros", sector: "E-commerce LatAm", dy: 0.00, buyDecision: "Comprar" },

  // --- CRIPTOMOEDAS ---
  BTC: { code: "BTC", name: "Bitcoin", price: 445000, category: "Criptomoedas", sector: "Criptoativo / Reserva Digital", dy: 0, buyDecision: "Comprar" },
  ETH: { code: "ETH", name: "Ethereum", price: 18450, category: "Criptomoedas", sector: "Smart Contracts / Web3", dy: 0, buyDecision: "Comprar" },
  SOL: { code: "SOL", name: "Solana", price: 1150, category: "Criptomoedas", sector: "Smart Contracts de Alta Velocidade", dy: 0, buyDecision: "Comprar" },
  BNB: { code: "BNB", name: "Binance Coin", price: 3850, category: "Criptomoedas", sector: "Exchange Utility", dy: 0, buyDecision: "Manter" },
  USDT: { code: "USDT", name: "Tether USD", price: 5.18, category: "Criptomoedas", sector: "Stablecoin Dólar", dy: 0, buyDecision: "Manter" },
  ADA: { code: "ADA", name: "Cardano", price: 4.80, category: "Criptomoedas", sector: "Smart Contracts", dy: 0, buyDecision: "Manter" },
  XRP: { code: "XRP", name: "Ripple XRP", price: 12.40, category: "Criptomoedas", sector: "Pagamentos Globais", dy: 0, buyDecision: "Manter" },

  // --- INTERNACIONAL (fora da B3, sem cotação ao vivo neste app) ---
  IVV: { code: "IVV", name: "iShares Core S&P 500 ETF", price: 523.00, category: "ETFs", sector: "ETF Internacional (S&P 500)", dy: 0, buyDecision: "Manter" },

  // --- RENDA FIXA ---
  LCIINTER: { code: "LCIINTER", name: "LCI Inter", price: 570.50, category: "Outros", sector: "Renda Fixa · 90% CDI", dy: 0, buyDecision: "Manter" }
};

export function searchB3Assets(query: string, maxResults = 12): B3AssetData[] {
  if (!query || !query.trim()) return [];
  const clean = query.toUpperCase().trim();
  
  const matches: B3AssetData[] = [];
  
  // Exact code match or prefix match first
  for (const key of Object.keys(B3_ASSET_DATABASE)) {
    const item = B3_ASSET_DATABASE[key];
    if (item.code.startsWith(clean)) {
      matches.push(item);
    }
  }

  // Name or sector match next
  for (const key of Object.keys(B3_ASSET_DATABASE)) {
    const item = B3_ASSET_DATABASE[key];
    if (!item.code.startsWith(clean) && (
      item.code.includes(clean) || 
      item.name.toUpperCase().includes(clean) || 
      item.sector.toUpperCase().includes(clean)
    )) {
      matches.push(item);
    }
  }

  return matches.slice(0, maxResults);
}
