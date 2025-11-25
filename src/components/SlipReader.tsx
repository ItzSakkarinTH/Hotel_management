// SlipReaderIntegrated.tsx - ใช้ในหน้า BookingPage
'use client';

import { useState, useRef } from 'react';
import jsQR from 'jsqr';
import Tesseract from 'tesseract.js';
import styles from './SlipReader.module.css';
import { QRData, OCRData, SlipData } from '@/types';

interface SlipReaderProps {
  expectedAmount: number; // จำนวนเงินที่คาดหวัง (ค่าห้อง + เงินประกัน)
  onSlipVerified: (slipData: SlipData) => void;
  onError: (error: string) => void;
}

export default function SlipReaderIntegrated({ expectedAmount, onSlipVerified, onError }: SlipReaderProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ message: '', percent: 0 });
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [ocrData, setOcrData] = useState<OCRData | null>(null);
  const [verified, setVerified] = useState(false);
  const [dragging, setDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      onError('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }

    // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
    if (file.size > 5 * 1024 * 1024) {
      onError('ไฟล์มีขนาดใหญ่เกินไป (ไม่เกิน 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewImage(result);
      setQrData(null);
      setOcrData(null);
      setVerified(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const processImage = async () => {
    if (!previewImage) return;

    setLoading(true);
    setProgress({ message: 'กำลังประมวลผล...', percent: 0 });

    try {
      // อ่าน QR Code
      setProgress({ message: 'กำลังอ่าน QR Code...', percent: 25 });
      const qr = await scanQRCode();
      setQrData(qr);

      // อ่าน OCR
      setProgress({ message: 'กำลังอ่านข้อความจากสลิป...', percent: 50 });
      const ocr = await performOCR();
      setOcrData(ocr);

      // ตรวจสอบความถูกต้อง
      setProgress({ message: 'กำลังตรวจสอบข้อมูล...', percent: 90 });
      const isValid = verifySlipData(qr, ocr);

      if (isValid) {
        setVerified(true);
        setProgress({ message: 'ตรวจสอบเรียบร้อย!', percent: 100 });

        // ส่งข้อมูลกลับไปยัง parent component
        onSlipVerified({
          qrData: qr,
          ocrData: ocr,
          slipImage: previewImage,
        });
      } else {
        onError('ไม่พบข้อมูลการโอนเงินที่ตรงกับจำนวนที่ต้องชำระ');
      }

      setTimeout(() => setLoading(false), 500);
    } catch (err) {
      onError('เกิดข้อผิดพลาดในการประมวลผล: ' + (err as Error).message);
      setLoading(false);
    }
  };

  const verifySlipData = (qr: QRData | null, ocr: OCRData | null): boolean => {
    // ตรวจสอบจำนวนเงินจาก QR Code หรือ OCR
    const qrAmount = qr?.amount ? parseFloat(qr.amount) : null;
    const ocrAmount = ocr?.amount ? parseFloat(ocr.amount) : null;

    // ยอมรับความผิดพลาดไม่เกิน 1 บาท
    const tolerance = 1;

    if (qrAmount !== null) {
      return Math.abs(qrAmount - expectedAmount) <= tolerance;
    }

    if (ocrAmount !== null) {
      return Math.abs(ocrAmount - expectedAmount) <= tolerance;
    }

    // ถ้าไม่พบจำนวนเงิน ให้ผ่าน แต่แจ้งเตือน
    return false;
  };

  const scanQRCode = (): Promise<QRData | null> => {
    return new Promise((resolve) => {
      if (!canvasRef.current || !imageRef.current) {
        resolve(null);
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;

      if (!ctx) {
        resolve(null);
        return;
      }

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        resolve(parsePromptPayData(code.data));
      } else {
        resolve(null);
      }
    });
  };

  const performOCR = async (): Promise<OCRData | null> => {
    try {
      if (!previewImage) return null;

      const result = await Tesseract.recognize(previewImage, 'tha+eng', {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') {
            const progressPercent = Math.round(m.progress * 100);
            setProgress({
              message: `กำลังอ่านข้อความ... ${progressPercent}%`,
              percent: 50 + progressPercent * 0.4,
            });
          }
        },
      });

      return extractSlipInfo(result.data.text);
    } catch (err) {
      console.error('OCR Error:', err);
      return null;
    }
  };

  const parsePromptPayData = (data: string): QRData | null => {
    try {
      const info: QRData = {
        merchantID: '',
        amount: '',
        reference: '',
        billPaymentRef1: '',
        billPaymentRef2: '',
      };

      let i = 0;
      while (i < data.length) {
        const tag = data.substring(i, i + 2);
        i += 2;

        const length = parseInt(data.substring(i, i + 2));
        i += 2;

        const value = data.substring(i, i + length);
        i += length;

        if (tag === '29' && value.length > 0) {
          let j = 0;
          while (j < value.length) {
            const subTag = value.substring(j, j + 2);
            j += 2;
            const subLength = parseInt(value.substring(j, j + 2));
            j += 2;
            const subValue = value.substring(j, j + subLength);
            j += subLength;

            if (subTag === '01') {
              info.merchantID = formatPromptPayID(subValue);
            }
          }
        }

        if (tag === '54') {
          info.amount = value;
        }

        if (tag === '62' && value.length > 0) {
          let j = 0;
          while (j < value.length) {
            const subTag = value.substring(j, j + 2);
            j += 2;
            const subLength = parseInt(value.substring(j, j + 2));
            j += 2;
            const subValue = value.substring(j, j + subLength);
            j += subLength;

            if (subTag === '05') {
              info.reference = subValue;
            }
            if (subTag === '01') {
              info.billPaymentRef1 = subValue;
            }
            if (subTag === '02') {
              info.billPaymentRef2 = subValue;
            }
          }
        }
      }

      return info;
    } catch {
      return null;
    }
  };

  const formatPromptPayID = (id: string): string => {
    if (id.length === 15 && id.startsWith('00')) {
      const citizenID = id.substring(2);
      return citizenID.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, '$1-$2-$3-$4-$5');
    }
    if (id.length === 13 && id.startsWith('66')) {
      const phoneNumber = '0' + id.substring(2);
      return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    if (id.length === 15 && id.startsWith('01')) {
      return id.substring(2);
    }
    return id;
  };

  const extractSlipInfo = (text: string): OCRData => {
    const info: OCRData = {
      amount: null,
      fee: null,
      date: null,
      time: null,
      reference: null,
      transactionNo: null,
      fromAccount: null,
      toAccount: null,
      transferType: null,
    };

    const cleanText = text
      .replace(/[^\u0E00-\u0E7Fa-zA-Z0-9\s\.\,\:\-\/\(\)\฿]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // ค้นหาจำนวนเงิน
    const amountPatterns = [
      /(?:จำนวนเงิน|จ่าย|ยอดเงิน|โอน)[:\s]+([0-9]{1,3}(?:,?[0-9]{3})*\.[0-9]{2})/i,
      /(?:Amount|Total|Pay)[:\s]+([0-9]{1,3}(?:,?[0-9]{3})*\.[0-9]{2})/i,
      /THB[:\s]+([0-9]{1,3}(?:,?[0-9]{3})*\.[0-9]{2})/i,
      /฿[:\s]*([0-9]{1,3}(?:,?[0-9]{3})*\.[0-9]{2})/,
      /([0-9]{1,3}(?:,?[0-9]{3})*\.[0-9]{2})\s*(?:บาท|Baht)/i,
      /\b([1-9][0-9]{0,2}(?:,?[0-9]{3})*\.[0-9]{2})\b/,
    ];

    for (const pattern of amountPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        const amount = match[1].replace(/,/g, '');
        const numAmount = parseFloat(amount);
        if (!isNaN(numAmount) && numAmount >= 0.01 && numAmount <= 10000000) {
          info.amount = amount;
          break;
        }
      }
    }

    // ค้นหาวันที่
    const datePatterns = [
      /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4})/i,
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/,
      /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        info.date = match[1];
        break;
      }
    }

    // ค้นหาเวลา
    const timePatterns = [
      /(\d{1,2}:\d{2}:\d{2}(?:\s*(?:AM|PM|น\.|am|pm))?)/i,
      /(\d{1,2}:\d{2}(?:\s*(?:AM|PM|น\.|am|pm))?)/i,
    ];

    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        info.time = match[1];
        break;
      }
    }

    // ค้นหาหมายเลขอ้างอิง
    const refPatterns = [
      /(?:เลขที่อ้างอิง|หมายเลขอ้างอิง|อ้างอิง|Reference|Ref\s*No\.?|Ref\.?)[:\s]*([A-Z0-9]{10,})/i,
      /(?:Transaction\s*(?:ID|No|Number))[:\s]*([A-Z0-9]{10,})/i,
      /\b([A-Z]{3,6}[0-9]{8,})\b/,
    ];

    for (const pattern of refPatterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].length >= 10 && match[1].length <= 50) {
        info.reference = match[1].trim();
        break;
      }
    }

    // ตรวจสอบประเภทการโอน
    const lowerText = text.toLowerCase();
    if (lowerText.includes('promptpay') || text.includes('พร้อมเพย์')) {
      info.transferType = 'PromptPay';
    } else if (text.includes('โอน') || lowerText.includes('transfer')) {
      info.transferType = 'โอนเงิน';
    }

    return info;
  };

  const resetUpload = () => {
    setPreviewImage(null);
    setQrData(null);
    setOcrData(null);
    setVerified(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.slipReaderContainer}>
      <h3 className={styles.slipReaderTitle}>อัปโหลดสลิปการโอนเงิน</h3>
      <p className={styles.slipReaderSubtitle}>
        จำนวนที่ต้องชำระ: <strong>{expectedAmount.toLocaleString()} บาท</strong>
      </p>

      {!previewImage ? (
        <div
          className={`${styles.dropzone} ${dragging ? styles.dropzoneDragging : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className={styles.dropzoneIcon}>📄</div>
          <div className={styles.dropzoneText}>
            คลิกเพื่ออัปโหลดสลิป หรือลากไฟล์มาวางที่นี่
          </div>
          <div className={styles.dropzoneSubtext}>
            รองรับไฟล์ JPG, PNG (ไม่เกิน 5MB)
          </div>
        </div>
      ) : (
        <div className={styles.previewSection}>
          <div className={styles.imagePreview}>
            <img
              ref={imageRef}
              src={previewImage}
              alt="Preview"
              className={styles.previewImage}
              onLoad={() => processImage()}
            />
          </div>
          <canvas ref={canvasRef} className={styles.hiddenCanvas}></canvas>

          {loading && (
            <div className={styles.progressCard}>
              <h6 className={styles.progressTitle}>{progress.message}</h6>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress.percent}%` }}
                ></div>
              </div>
              <div className={styles.progressPercent}>{progress.percent}%</div>
            </div>
          )}

          {verified && !loading && (
            <div className={styles.successAlert}>
              ✅ ตรวจสอบสลิปเรียบร้อย! จำนวนเงินตรงกับที่ต้องชำระ
            </div>
          )}

          {ocrData && !loading && (
            <div className={styles.dataCard}>
              <h5 className={styles.dataCardTitle}>📄 ข้อมูลจากสลิป</h5>

              {ocrData.amount && (
                <div className={styles.dataItem}>
                  <small className={styles.dataLabel}>💰 จำนวนเงิน</small>
                  <div className={styles.dataValueLarge}>
                    {parseFloat(ocrData.amount).toLocaleString('th-TH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} บาท
                  </div>
                </div>
              )}

              {ocrData.date && (
                <div className={styles.dataItem}>
                  <small className={styles.dataLabel}>📅 วันที่-เวลา</small>
                  <div className={styles.dataValue}>
                    {ocrData.date} {ocrData.time || ''}
                  </div>
                </div>
              )}

              {ocrData.reference && (
                <div className={styles.dataItem}>
                  <small className={styles.dataLabel}>🔖 หมายเลขอ้างอิง</small>
                  <div className={styles.dataValue}>
                    <span className={styles.badge}>{ocrData.reference}</span>
                  </div>
                </div>
              )}

              {ocrData.transferType && (
                <div className={styles.dataItem}>
                  <small className={styles.dataLabel}>📱 ประเภทการโอน</small>
                  <div className={styles.dataValue}>{ocrData.transferType}</div>
                </div>
              )}
            </div>
          )}

          {qrData && !loading && (
            <div className={styles.qrCard}>
              <h5 className={styles.qrCardTitle}>📱 ข้อมูลจาก QR Code</h5>

              {qrData.amount && (
                <div className={styles.qrItem}>
                  <small className={styles.qrLabel}>💰 จำนวนเงิน</small>
                  <div className={styles.qrValueLarge}>
                    {parseFloat(qrData.amount).toLocaleString('th-TH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} บาท
                  </div>
                </div>
              )}

              {qrData.merchantID && (
                <div className={styles.qrItem}>
                  <small className={styles.qrLabel}>👤 PromptPay ID</small>
                  <div className={styles.qrValue}>{qrData.merchantID}</div>
                </div>
              )}
            </div>
          )}

          {!loading && (
            <button
              className={styles.resetButton}
              onClick={resetUpload}
            >
              📤 อัปโหลดสลิปใหม่
            </button>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className={styles.fileInput}
        accept="image/*"
        onChange={handleFileSelect}
      />
    </div>
  );
}