package com.smarttransit.ticketservice.util;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageConfig;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;

public final class QrPdfUtil {
    private QrPdfUtil() {}

    public static byte[] generateQrPng(String text, int size) throws WriterException, IOException {
        QRCodeWriter qrWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrWriter.encode(text, BarcodeFormat.QR_CODE, size, size);
        BufferedImage image = MatrixToImageWriter.toBufferedImage(bitMatrix, new MatrixToImageConfig());
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            javax.imageio.ImageIO.write(image, "PNG", baos);
            return baos.toByteArray();
        }
    }

    public static byte[] generatePdfWithQr(byte[] qrPng, String title) throws IOException {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);
            PDImageXObject pdImage = PDImageXObject.createFromByteArray(doc, qrPng, "qr");
            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                // draw title
                cs.beginText();
                cs.setFont(org.apache.pdfbox.pdmodel.font.PDType1Font.HELVETICA_BOLD, 14);
                cs.newLineAtOffset(50, 750);
                cs.showText(title == null ? "Ticket" : title);
                cs.endText();

                // draw QR image
                float imgX = 50;
                float imgY = 600;
                float imgW = 200;
                float imgH = 200;
                cs.drawImage(pdImage, imgX, imgY, imgW, imgH);
            }
            try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                doc.save(baos);
                return baos.toByteArray();
            }
        }
    }

    public static String toDataUrl(byte[] png) {
        String b64 = Base64.getEncoder().encodeToString(png);
        return "data:image/png;base64," + b64;
    }
}
