import QRCode from 'qrcode';

// Função auxiliar para calcular o CRC16 CCITT
function crc16(payload: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) crc = (crc << 1) ^ 0x1021;
      else crc = crc << 1;
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// Função auxiliar para formatar campo TLV (Tag, Length, Value)
function formatPixField(id: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

export interface PixParams {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount: number;
  tableNumber: number | string;
}

export async function generateTablePix({
  pixKey,
  merchantName,
  merchantCity,
  amount,
  tableNumber
}: PixParams): Promise<{ pixCopiaECola: string; qrCodeImage: string }> {
  // O valor deve ter sempre 2 casas decimais. Ex: "150.50"
  const formattedAmount = amount.toFixed(2);
  
  // Mensagem/Descrição
  const description = `Consumo Mesa ${tableNumber}`;

  // ID 26: Dados da Conta/Recebedor
  const accountInfo = 
    formatPixField('00', 'br.gov.bcb.pix') + // GUI do Banco Central
    formatPixField('01', pixKey) +           // Chave Pix
    formatPixField('02', description);       // Descrição do pagamento

  let payload = '';
  payload += formatPixField('00', '01');                            // Versão do Payload
  payload += formatPixField('26', accountInfo);                     // Informações da Conta
  payload += formatPixField('52', '0000');                          // Categoria
  payload += formatPixField('53', '986');                           // Moeda (986 = Real Brasileiro)
  payload += formatPixField('54', formattedAmount);                 // Valor
  payload += formatPixField('58', 'BR');                            // País
  
  // Tratamento de acentos e tamanho
  const safeName = merchantName.substring(0, 25).normalize('NFD').replace(/[\u0300-\u036f]/g, ""); 
  const safeCity = merchantCity.substring(0, 15).normalize('NFD').replace(/[\u0300-\u036f]/g, "");
  
  payload += formatPixField('59', safeName);                        // Nome do Recebedor
  payload += formatPixField('60', safeCity);                        // Cidade

  // ID 62: Dados Adicionais (Usamos para um ID de transação customizado)
  const txId = `MESA${tableNumber}`; 
  const additionalData = formatPixField('05', txId);
  payload += formatPixField('62', additionalData);

  // Fecha o código adicionando o ID 63 que informa onde o verificador CRC16 entra
  payload += '6304'; 

  // Calcula o CRC16
  const finalStringPix = payload + crc16(payload);

  // Gera a imagem do QR Code em Base64
  const qrCodeImage = await QRCode.toDataURL(finalStringPix);

  return {
    pixCopiaECola: finalStringPix,
    qrCodeImage
  };
}
