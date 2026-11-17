/**
 * Module Xuất Báo cáo Excel theo 2 biểu mẫu công ty (Mục 8 PRD)
 * Đường dẫn: lib/xuat/xuat-excel.ts
 *
 * Cài đặt thư viện bắt buộc:
 *   npm install exceljs file-saver
 *   npm install -D @types/file-saver
 *
 * Gồm 2 hàm chính:
 * 1. xuatBieuMauQuyTrinh(danhSachDong, cauHinh, thongTinMaHang) - Mục 8.1 (13 cột chi tiết)
 * 2. xuatBieuMauDonGia(danhSachDong, cauHinh, thongTinMaHang) - Mục 8.2 (12 cột gộp theo công đoạn lớn)
 */

import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';
import {
  gopNhomCongDoan,
  tinhDongQuyTrinh,
  tinhTongQuyTrinh,
} from '../cong-thuc/tinh-toan';
import type { QuyTrinhChiTiet, ThamSoTinhToan } from '../doi-tuong/types';

const saveAs =
  (FileSaver as unknown as { saveAs?: typeof FileSaver }).saveAs ?? FileSaver;

/** Thông tin mã hàng và quy trình hiển thị ở đầu trang báo cáo Excel (Mục 8.1 & 8.2) */
export interface ThongTinMaHangXuatExcel {
  ma_hang: string;
  ten_hang?: string | null;
  quy_cach?: string | null;
  khach_hang?: string | null;
  rev: string;
  ngay_lap: string;
  thoi_gian_bat_dau_ap_dung?: string | null;
}

/** Khung viền mỏng tiêu chuẩn cho các ô dữ liệu và bảng chữ ký */
const BORDER_THIN: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FF94A3B8' } },
  left: { style: 'thin', color: { argb: 'FF94A3B8' } },
  bottom: { style: 'thin', color: { argb: 'FF94A3B8' } },
  right: { style: 'thin', color: { argb: 'FF94A3B8' } },
};

/** Màu nền tiêu đề bảng (#14539E) */
const FILL_HEADER: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF14539E' },
};

/** Màu nền dòng TOTAL (#E2E8F0) */
const FILL_TOTAL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFE2E8F0' },
};

/** Màu nền tiêu đề khối chữ ký (#F1F5F9) */
const FILL_SIGN_HEADER: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFF1F5F9' },
};

const EXCEL_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/**
 * Hàm phụ trợ thêm khối chữ ký ở cuối báo cáo Excel:
 * NGƯỜI LẬP | KIỂM TRA 1 | KIỂM TRA 2 | KIỂM TRA 3 | PHÊ DUYỆT
 */
function themKhoiChuKyCuoiBang(
  worksheet: ExcelJS.Worksheet,
  dongBatDau: number
): void {
  const tieuDeChuKy = [
    'NGƯỜI LẬP\n(Prepared by)',
    'KIỂM TRA 1\n(Checked by)',
    'KIỂM TRA 2\n(Checked by)',
    'KIỂM TRA 3\n(Checked by)',
    'PHÊ DUYỆT\n(Approved by)',
  ];

  // Cặp cột gộp cho từng ô chữ ký (mỗi ô chiếm 2 cột để cân đối trang in)
  const capCot: [number, number][] = [
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [9, 10],
  ];

  const rowHeaderIdx = dongBatDau + 1;
  const rowSignSpaceIdx = dongBatDau + 2;

  worksheet.getRow(rowHeaderIdx).height = 30;
  worksheet.getRow(rowSignSpaceIdx).height = 65;

  tieuDeChuKy.forEach((nhan, idx) => {
    const [colStart, colEnd] = capCot[idx];
    worksheet.mergeCells(rowHeaderIdx, colStart, rowHeaderIdx, colEnd);
    worksheet.mergeCells(rowSignSpaceIdx, colStart, rowSignSpaceIdx, colEnd);

    const headerCell = worksheet.getCell(rowHeaderIdx, colStart);
    headerCell.value = nhan;
    headerCell.font = { name: 'Arial', size: 9, bold: true };
    headerCell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };
    headerCell.fill = FILL_SIGN_HEADER;

    const spaceCell = worksheet.getCell(rowSignSpaceIdx, colStart);
    spaceCell.value = '';

    // Đóng khung toàn bộ các ô trong vùng merge
    for (let c = colStart; c <= colEnd; c++) {
      worksheet.getCell(rowHeaderIdx, c).border = BORDER_THIN;
      worksheet.getCell(rowSignSpaceIdx, c).border = BORDER_THIN;
    }
  });
}

/**
 * Chuyển Workbook của ExcelJS thành Blob và tự động tải xuống trình duyệt (nếu bật)
 */
async function xuatWorkbookRaBlob(
  workbook: ExcelJS.Workbook,
  tenFile: string,
  tuDongTaiXuong: boolean
): Promise<Blob> {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: EXCEL_MIME_TYPE });

  if (tuDongTaiXuong && typeof window !== 'undefined') {
    saveAs(blob, tenFile);
  }

  return blob;
}

/**
 * 1. XUẤT BIỂU MẪU QUY TRÌNH SẢN XUẤT (Mục 8.1 PRD - In từng dòng chi tiết 13 cột)
 */
export async function xuatBieuMauQuyTrinh(
  danhSachDong: QuyTrinhChiTiet[],
  cauHinh: ThamSoTinhToan,
  thongTinMaHang: ThongTinMaHangXuatExcel,
  tuDongTaiXuong: boolean = true
): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AppST';
  workbook.created = new Date();

  const ws = workbook.addWorksheet('QuyTrinhSanXuat', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true },
  });

  // 1. Tiêu đề biểu mẫu (Mục 8.1)
  ws.mergeCells('A1:M1');
  const titleVi = ws.getCell('A1');
  titleVi.value = 'BẢNG QUY TRÌNH SẢN XUẤT MÃ HÀNG MỚI';
  titleVi.font = {
    name: 'Arial',
    size: 14,
    bold: true,
    color: { argb: 'FF14539E' },
  };
  titleVi.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 24;

  ws.mergeCells('A2:M2');
  const titleEn = ws.getCell('A2');
  titleEn.value = 'Production Process for New product codes';
  titleEn.font = { name: 'Arial', size: 10, italic: true };
  titleEn.alignment = { horizontal: 'center', vertical: 'middle' };

  // 2. Thông tin đầu trang: Mã hàng, Tên hàng, REV, Quy cách, Khách hàng, Ngày lập
  ws.getCell('A4').value = 'Mã hàng:';
  ws.getCell('A4').font = { name: 'Arial', size: 10, bold: true };
  ws.getCell('B4').value = thongTinMaHang.ma_hang;
  ws.getCell('B4').font = { name: 'Arial', size: 10, bold: true };

  ws.getCell('D4').value = 'Tên hàng:';
  ws.getCell('D4').font = { name: 'Arial', size: 10, bold: true };
  ws.getCell('E4').value = thongTinMaHang.ten_hang ?? '';

  ws.getCell('I4').value = 'REV:';
  ws.getCell('I4').font = { name: 'Arial', size: 10, bold: true };
  ws.getCell('J4').value = thongTinMaHang.rev;
  ws.getCell('J4').font = { name: 'Arial', size: 10, bold: true };

  ws.getCell('A5').value = 'Khách hàng:';
  ws.getCell('A5').font = { name: 'Arial', size: 10, bold: true };
  ws.getCell('B5').value = thongTinMaHang.khach_hang ?? '';

  ws.getCell('D5').value = 'Quy cách:';
  ws.getCell('D5').font = { name: 'Arial', size: 10, bold: true };
  ws.getCell('E5').value = thongTinMaHang.quy_cach ?? '';

  ws.getCell('I5').value = 'Ngày lập:';
  ws.getCell('I5').font = { name: 'Arial', size: 10, bold: true };
  ws.getCell('J5').value = thongTinMaHang.ngay_lap;

  // 3. Tiêu đề 13 cột theo đúng thứ tự Mục 8.1
  const headerRowIdx = 7;
  const cotQuyTrinh = [
    { header: 'STT', width: 7 },
    { header: 'Công đoạn', width: 20 },
    { header: 'Công đoạn chi tiết', width: 24 },
    { header: 'Thao tác chi tiết', width: 28 },
    { header: 'Thiết bị', width: 22 },
    { header: 'JIG', width: 22 },
    { header: 'Số sản phẩm', width: 13 },
    { header: 'Điều kiện làm việc', width: 18 },
    { header: 'Số người làm việc', width: 16 },
    { header: 'Sản lượng làm việc (pcs/giờ)', width: 22 },
    { header: 'ST (s)', width: 14 },
    { header: 'Đơn giá', width: 16 },
    { header: 'Ghi chú', width: 18 },
  ];

  cotQuyTrinh.forEach((col, i) => {
    ws.getColumn(i + 1).width = col.width;
    const cell = ws.getCell(headerRowIdx, i + 1);
    cell.value = col.header;
    cell.font = {
      name: 'Arial',
      size: 10,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    cell.fill = FILL_HEADER;
    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };
    cell.border = BORDER_THIN;
  });
  ws.getRow(headerRowIdx).height = 28;

  // 4. Ghi từng dòng quy trình chi tiết
  danhSachDong.forEach((dong, idx) => {
    const kq = tinhDongQuyTrinh(dong, cauHinh);
    const rIdx = headerRowIdx + 1 + idx;
    const row = ws.getRow(rIdx);

    // Dòng không dùng thiết bị hiển thị "Thủ công", không dùng JIG để trống (Mục 8.1)
    const tenThietBi =
      dong.ten_thiet_bi?.trim() ||
      (dong.thiet_bi_id ? `Thiết bị #${dong.thiet_bi_id}` : 'Thủ công');
    const tenJig =
      dong.ten_jig?.trim() || (dong.jig_id ? `JIG #${dong.jig_id}` : '');

    const values = [
      dong.stt || idx + 1,
      dong.ten_cong_doan ?? `Công đoạn #${dong.cong_doan_id}`,
      dong.ten_cong_doan_chi_tiet ?? `Chi tiết #${dong.cong_doan_chi_tiet_id}`,
      dong.thao_tac ?? '',
      tenThietBi,
      tenJig,
      kq.so_san_pham_hien_thi,
      dong.ten_dieu_kien ?? `ĐK #${dong.dieu_kien_id}`,
      dong.so_nguoi,
      dong.san_luong_gio,
      kq.co_loi_chia_0 ? '—' : (kq.st_giay ?? 0),
      kq.co_loi_chia_0 ? '—' : (kq.don_gia_vnd ?? 0),
      dong.ghi_chu ?? '',
    ];

    values.forEach((val, cIdx) => {
      const cell = row.getCell(cIdx + 1);
      cell.value = val;
      cell.font = { name: 'Arial', size: 10 };
      cell.border = BORDER_THIN;

      if ([0, 6, 7].includes(cIdx)) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if ([8, 9, 10, 11].includes(cIdx)) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      } else {
        cell.alignment = {
          horizontal: 'left',
          vertical: 'middle',
          wrapText: true,
        };
      }
    });

    row.getCell(9).numFmt = '#,##0.##';
    row.getCell(10).numFmt = '#,##0';
    if (!kq.co_loi_chia_0) {
      row.getCell(11).numFmt = '#,##0.00';
      row.getCell(12).numFmt = '#,##0.00';
    }
  });

  // 5. Dòng TOTAL cuối bảng (Mục 8.1)
  const tong = tinhTongQuyTrinh(danhSachDong, cauHinh);
  const totalRowIdx = headerRowIdx + 1 + danhSachDong.length;
  ws.mergeCells(totalRowIdx, 1, totalRowIdx, 8);

  const totalLabelCell = ws.getCell(totalRowIdx, 1);
  totalLabelCell.value = 'TOTAL';
  totalLabelCell.alignment = { horizontal: 'right', vertical: 'middle' };

  ws.getCell(totalRowIdx, 9).value = tong.tong_so_nguoi;
  ws.getCell(totalRowIdx, 9).numFmt = '#,##0.##';
  ws.getCell(totalRowIdx, 10).value = '';
  ws.getCell(totalRowIdx, 11).value = tong.co_loi_chia_0
    ? '—'
    : (tong.tong_st_giay ?? 0);
  ws.getCell(totalRowIdx, 11).numFmt = '#,##0.00';
  ws.getCell(totalRowIdx, 12).value = tong.co_loi_chia_0
    ? '—'
    : (tong.tong_don_gia_vnd ?? 0);
  ws.getCell(totalRowIdx, 12).numFmt = '#,##0.00';
  ws.getCell(totalRowIdx, 13).value = '';

  for (let c = 1; c <= 13; c++) {
    const cell = ws.getCell(totalRowIdx, c);
    cell.font = { name: 'Arial', size: 10, bold: true };
    cell.fill = FILL_TOTAL;
    cell.border = BORDER_THIN;
  }
  ws.getRow(totalRowIdx).height = 22;

  // 6. Khối chữ ký cuối bảng
  themKhoiChuKyCuoiBang(ws, totalRowIdx + 1);

  const tenFile = `QuyTrinh_${thongTinMaHang.ma_hang}_${thongTinMaHang.rev}.xlsx`;
  return xuatWorkbookRaBlob(workbook, tenFile, tuDongTaiXuong);
}

/**
 * 2. XUẤT BIỂU MẪU ĐƠN GIÁ SẢN XUẤT (Mục 8.2 PRD - Gộp nhóm theo công đoạn lớn)
 * BẮT BUỘC gọi hàm gopNhomCongDoan() từ lib/cong-thuc/tinh-toan.
 */
export async function xuatBieuMauDonGia(
  danhSachDong: QuyTrinhChiTiet[],
  cauHinh: ThamSoTinhToan,
  thongTinMaHang: ThongTinMaHangXuatExcel,
  tuDongTaiXuong: boolean = true
): Promise<Blob> {
  // Gọi hàm gopNhomCongDoan để lấy mảng NhomCongDoan theo đúng quy tắc Mục 5
  const danhSachNhom = gopNhomCongDoan(danhSachDong, cauHinh);
  const tong = tinhTongQuyTrinh(danhSachDong, cauHinh);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AppST';
  workbook.created = new Date();

  const ws = workbook.addWorksheet('BangDonGia', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true },
  });

  // 1. Tiêu đề biểu mẫu (Mục 8.2)
  ws.mergeCells('A1:L1');
  const titleVi = ws.getCell('A1');
  titleVi.value = 'BẢNG ĐƠN GIÁ SẢN XUẤT MÃ HÀNG MỚI';
  titleVi.font = {
    name: 'Arial',
    size: 14,
    bold: true,
    color: { argb: 'FF14539E' },
  };
  titleVi.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 24;

  ws.mergeCells('A2:L2');
  const titleEn = ws.getCell('A2');
  titleEn.value = 'Price list for new product codes';
  titleEn.font = { name: 'Arial', size: 10, italic: true };
  titleEn.alignment = { horizontal: 'center', vertical: 'middle' };

  // 2. Đầu trang (Mục 8.2): Mã hàng, Tên hàng, Quy cách, Khách hàng, Lương cơ bản, Đơn giá, REV, Thời gian áp dụng, Ngày lập
  ws.getCell('A4').value = 'Mã hàng:';
  ws.getCell('A4').font = { name: 'Arial', size: 10, bold: true };
  ws.getCell('B4').value = thongTinMaHang.ma_hang;
  ws.getCell('B4').font = { name: 'Arial', size: 10, bold: true };

  ws.getCell('D4').value = 'Tên hàng:';
  ws.getCell('D4').font = { name: 'Arial', size: 10, bold: true };
  ws.getCell('E4').value = thongTinMaHang.ten_hang ?? '';

  ws.getCell('H4').value = 'Lương cơ bản:';
  ws.getCell('H4').font = { name: 'Arial', size: 10, bold: true };
  ws.getCell('I4').value = cauHinh.luong_co_ban;
  ws.getCell('I4').numFmt = '#,##0';

  ws.getCell('K4').value = 'REV:';
  ws.getCell('K4').font = { name: 'Arial', size: 10, bold: true };
  ws.getCell('L4').value = thongTinMaHang.rev;
  ws.getCell('L4').font = { name: 'Arial', size: 10, bold: true };

  ws.getCell('A5').value = 'Khách hàng:';
  ws.getCell('A5').font = { name: 'Arial', size: 10, bold: true };
  ws.getCell('B5').value = thongTinMaHang.khach_hang ?? '';

  ws.getCell('D5').value = 'Quy cách:';
  ws.getCell('D5').font = { name: 'Arial', size: 10, bold: true };
  ws.getCell('E5').value = thongTinMaHang.quy_cach ?? '';

  ws.getCell('H5').value = 'Đơn giá (VNĐ):';
  ws.getCell('H5').font = { name: 'Arial', size: 10, bold: true };
  ws.getCell('I5').value = tong.co_loi_chia_0
    ? '—'
    : (tong.tong_don_gia_vnd ?? 0);
  ws.getCell('I5').numFmt = '#,##0.00';

  ws.getCell('K5').value = 'Ngày lập:';
  ws.getCell('K5').font = { name: 'Arial', size: 10, bold: true };
  ws.getCell('L5').value = thongTinMaHang.ngay_lap;

  ws.getCell('H6').value = 'Thời gian áp dụng:';
  ws.getCell('H6').font = { name: 'Arial', size: 10, bold: true };
  ws.getCell('I6').value =
    thongTinMaHang.thoi_gian_bat_dau_ap_dung ?? thongTinMaHang.ngay_lap;

  // 3. Tiêu đề 12 cột theo đúng thứ tự Mục 8.2 PRD
  const headerRowIdx = 8;
  const cotDonGia = [
    { header: 'Công đoạn', width: 22 },
    { header: 'Số người', width: 12 },
    { header: 'Điều kiện làm việc', width: 18 },
    { header: 'Số sản phẩm', width: 14 },
    { header: 'Sản lượng pcs/1h', width: 16 },
    { header: 'Sản lượng pcs/8h', width: 16 },
    { header: 'Lương khoán/tháng', width: 18 },
    { header: 'Thời gian làm việc/tháng', width: 20 },
    { header: 'Lương tiêu chuẩn/1h', width: 18 },
    { header: 'Đơn giá', width: 15 },
    { header: 'ST', width: 14 },
    { header: 'Ghi chú', width: 18 },
  ];

  cotDonGia.forEach((col, i) => {
    ws.getColumn(i + 1).width = col.width;
    const cell = ws.getCell(headerRowIdx, i + 1);
    cell.value = col.header;
    cell.font = {
      name: 'Arial',
      size: 10,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    cell.fill = FILL_HEADER;
    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };
    cell.border = BORDER_THIN;
  });
  ws.getRow(headerRowIdx).height = 28;

  // 4. In mỗi nhóm NhomCongDoan thành 1 dòng trên Excel
  danhSachNhom.forEach((nhom, idx) => {
    const rIdx = headerRowIdx + 1 + idx;
    const row = ws.getRow(rIdx);

    const values = [
      nhom.ten_cong_doan,
      nhom.so_nguoi_nhom,
      nhom.ten_dieu_kien_nhom ?? '',
      nhom.so_san_pham_nhom ?? '',
      nhom.san_luong_1h_nhom ?? '',
      nhom.san_luong_8h_nhom ?? '',
      nhom.muc_khoan_nhom,
      nhom.thoi_gian_lam_viec_thang,
      nhom.luong_tieu_chuan_gio,
      nhom.co_loi_chia_0 ? '—' : (nhom.don_gia_vnd_nhom ?? 0),
      nhom.co_loi_chia_0 ? '—' : (nhom.st_nhom ?? 0),
      nhom.ghi_chu_nhom ?? '',
    ];

    values.forEach((val, cIdx) => {
      const cell = row.getCell(cIdx + 1);
      cell.value = val;
      cell.font = { name: 'Arial', size: 10 };
      cell.border = BORDER_THIN;

      if ([2, 3, 7].includes(cIdx)) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if ([1, 4, 5, 6, 8, 9, 10].includes(cIdx)) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      }
    });

    row.getCell(2).numFmt = '#,##0.##';
    if (nhom.san_luong_1h_nhom !== null) row.getCell(5).numFmt = '#,##0';
    if (nhom.san_luong_8h_nhom !== null) row.getCell(6).numFmt = '#,##0';
    row.getCell(7).numFmt = '#,##0';
    row.getCell(9).numFmt = '#,##0';
    if (!nhom.co_loi_chia_0) {
      row.getCell(10).numFmt = '#,##0.00';
      row.getCell(11).numFmt = '#,##0.00';
    }
  });

  // 5. Dòng TOTAL cuối bảng (Mục 8.2)
  const totalRowIdx = headerRowIdx + 1 + danhSachNhom.length;
  ws.getCell(totalRowIdx, 1).value = 'TOTAL';
  ws.getCell(totalRowIdx, 1).alignment = {
    horizontal: 'center',
    vertical: 'middle',
  };

  ws.getCell(totalRowIdx, 2).value = tong.tong_so_nguoi;
  ws.getCell(totalRowIdx, 2).numFmt = '#,##0.##';

  ws.getCell(totalRowIdx, 7).value = tong.tong_luong_khoan_thang;
  ws.getCell(totalRowIdx, 7).numFmt = '#,##0';

  ws.getCell(totalRowIdx, 10).value = tong.co_loi_chia_0
    ? '—'
    : (tong.tong_don_gia_vnd ?? 0);
  ws.getCell(totalRowIdx, 10).numFmt = '#,##0.00';

  ws.getCell(totalRowIdx, 11).value = tong.co_loi_chia_0
    ? '—'
    : (tong.tong_st_giay ?? 0);
  ws.getCell(totalRowIdx, 11).numFmt = '#,##0.00';

  for (let c = 1; c <= 12; c++) {
    const cell = ws.getCell(totalRowIdx, c);
    cell.font = { name: 'Arial', size: 10, bold: true };
    cell.fill = FILL_TOTAL;
    cell.border = BORDER_THIN;
  }
  ws.getRow(totalRowIdx).height = 22;

  // 6. Khối chữ ký cuối bảng
  themKhoiChuKyCuoiBang(ws, totalRowIdx + 1);

  const tenFile = `DonGia_${thongTinMaHang.ma_hang}_${thongTinMaHang.rev}.xlsx`;
  return xuatWorkbookRaBlob(workbook, tenFile, tuDongTaiXuong);
}
