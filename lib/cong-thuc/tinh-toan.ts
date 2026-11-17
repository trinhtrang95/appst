/**
 * Các hàm tính toán thuần (Pure Functions) cho hệ thống Quản lý quy trình sản xuất (AppST)
 * Tuân thủ chặt chẽ Mục 5 và Mục 14.2 của PRD:
 * - Không làm tròn trong quá trình tính toán trung gian, chỉ làm tròn khi hiển thị.
 * - Xử lý an toàn chia cho 0 (san_luong_gio <= 0 hoặc trống -> trả về null / hiển thị "—").
 * - Hoàn toàn độc lập, không gọi cơ sở dữ liệu hay thư viện giao diện (UI).
 */

import type {
  KetQuaTinhDong,
  NhomCongDoan,
  QuyTrinhChiTiet,
  QuyTrinhChiTietKemTinhToan,
  ThamSoTinhToan,
  TongQuyTrinh,
} from '../doi-tuong/types';

/** Giờ làm việc tiêu chuẩn mặc định trong tháng theo Mục 4.7 (208 giờ) */
export const GIO_LAM_THANG_MAC_DINH = 208;

/** Số giây trong 1 giờ */
export const SO_GIAY_MOT_GIO = 3600;

/** Số giờ trong 1 ca làm việc tiêu chuẩn (8 giờ) */
export const SO_GIO_MOT_CA = 8;

/** Ký hiệu hiển thị khi phép tính không hợp lệ hoặc chia cho 0 (Mục 5) */
export const KY_HIEU_CHIA_0 = '—';

/**
 * Kiểm tra một giá trị có phải là số dương hợp lệ (> 0) hay không
 */
function laSoDuongHopLe(giaTri: number | null | undefined): giaTri is number {
  return typeof giaTri === 'number' && Number.isFinite(giaTri) && giaTri > 0;
}

/**
 * Lấy số sản phẩm hiển thị của một dòng (Mục 4.9 & Mục 5)
 * Quy tắc: Nhập tay ở mọi dòng; nếu để trống (null/undefined) thì hiển thị là 1.
 */
export function laySoSanPhamHienThi(soSanPham?: number | null): number {
  if (laSoDuongHopLe(soSanPham)) {
    return Math.trunc(soSanPham);
  }
  return 1;
}

/**
 * Tính Lương khoán/tháng của một dòng hoặc một nhóm (Mục 5)
 * Công thức: Lương khoán/tháng = L × so_nguoi
 * Kiểm tra: L = 5.060.000, so_nguoi = 3 → 15.180.000
 */
export function tinhLuongKhoan(luongCoBan: number, soNguoi: number): number {
  if (!laSoDuongHopLe(luongCoBan) || !laSoDuongHopLe(soNguoi)) {
    return 0;
  }
  return luongCoBan * soNguoi;
}

/**
 * Tính Lương tiêu chuẩn/giờ (Mục 5)
 * Công thức: Lương tiêu chuẩn/giờ = L ÷ G
 * Kiểm tra: 5.060.000 ÷ 208 = 24.326,923... (hiển thị 24.327)
 */
export function tinhLuongTieuChuanGio(
  luongCoBan: number,
  gioLamThang: number = GIO_LAM_THANG_MAC_DINH
): number {
  if (!laSoDuongHopLe(luongCoBan) || !laSoDuongHopLe(gioLamThang)) {
    return 0;
  }
  return luongCoBan / gioLamThang;
}

/**
 * Tính ST (giây) của một dòng (Mục 5)
 * Công thức: ST (giây) = 3600 × so_nguoi ÷ san_luong_gio
 * Kiểm tra: 3 người, 5.480 pcs/giờ → 1,9708029... s (hiển thị 1,97 s)
 * Nếu san_luong_gio <= 0 hoặc trống: trả về null (không trả về Infinity / #DIV/0!).
 */
export function tinhSt(
  soNguoi: number,
  sanLuongGio?: number | null
): number | null {
  if (!laSoDuongHopLe(soNguoi) || !laSoDuongHopLe(sanLuongGio)) {
    return null;
  }
  return (SO_GIAY_MOT_GIO * soNguoi) / sanLuongGio;
}

/**
 * Tính Đơn giá VNĐ/pcs của một dòng (Mục 5)
 * Công thức: Đơn giá VNĐ/pcs = ST × L ÷ (G × 3600)
 * Kiểm tra: ST = 36 s, L = 5.060.000, G = 208 → 243,26923... VNĐ (hiển thị 243,27 VNĐ)
 */
export function tinhDonGiaVnd(
  stGiay: number | null | undefined,
  luongCoBan: number,
  gioLamThang: number = GIO_LAM_THANG_MAC_DINH
): number | null {
  if (
    !laSoDuongHopLe(stGiay) ||
    !laSoDuongHopLe(luongCoBan) ||
    !laSoDuongHopLe(gioLamThang)
  ) {
    return null;
  }
  return (stGiay * luongCoBan) / (gioLamThang * SO_GIAY_MOT_GIO);
}

/**
 * Tính Đơn giá USD/pcs (Mục 5)
 * Công thức: Đơn giá USD/pcs = Đơn giá VNĐ ÷ T
 */
export function tinhDonGiaUsd(
  donGiaVnd: number | null | undefined,
  tyGia: number
): number | null {
  if (!laSoDuongHopLe(donGiaVnd) || !laSoDuongHopLe(tyGia)) {
    return null;
  }
  return donGiaVnd / tyGia;
}

/**
 * Tính Sản lượng pcs/8 giờ (Mục 5)
 * Công thức: Sản lượng pcs/8 giờ = san_luong_gio × 8
 */
export function tinhSanLuong8h(sanLuongGio?: number | null): number | null {
  if (!laSoDuongHopLe(sanLuongGio)) {
    return null;
  }
  return sanLuongGio * SO_GIO_MOT_CA;
}

/**
 * Tính toàn bộ chỉ số tự động cho một dòng QuyTrinhChiTiet (Mục 5 - Cấp dòng)
 */
export function tinhDongQuyTrinh(
  dong: QuyTrinhChiTiet,
  cauHinh: ThamSoTinhToan
): QuyTrinhChiTietKemTinhToan {
  const gioLamThang = cauHinh.gio_lam_thang ?? GIO_LAM_THANG_MAC_DINH;
  const soSanPhamHienThi = laySoSanPhamHienThi(dong.so_san_pham);
  const luongKhoanThang = tinhLuongKhoan(cauHinh.luong_co_ban, dong.so_nguoi);
  const luongTieuChuanGio = tinhLuongTieuChuanGio(
    cauHinh.luong_co_ban,
    gioLamThang
  );

  const coLoiChia0 = !laSoDuongHopLe(dong.san_luong_gio);
  const stGiay = coLoiChia0 ? null : tinhSt(dong.so_nguoi, dong.san_luong_gio);
  const donGiaVnd =
    stGiay === null
      ? null
      : tinhDonGiaVnd(stGiay, cauHinh.luong_co_ban, gioLamThang);
  const donGiaUsd =
    donGiaVnd === null ? null : tinhDonGiaUsd(donGiaVnd, cauHinh.ty_gia);
  const sanLuong8h = coLoiChia0 ? null : tinhSanLuong8h(dong.san_luong_gio);

  const ketQua: KetQuaTinhDong = {
    so_san_pham_hien_thi: soSanPhamHienThi,
    luong_khoan_thang: luongKhoanThang,
    luong_tieu_chuan_gio: luongTieuChuanGio,
    san_luong_8h: sanLuong8h,
    st_giay: stGiay,
    don_gia_vnd: donGiaVnd,
    don_gia_usd: donGiaUsd,
    co_loi_chia_0: coLoiChia0,
    thong_bao_loi: coLoiChia0
      ? 'Sản lượng/giờ phải lớn hơn 0 (lỗi chia cho 0)'
      : null,
  };

  return {
    ...dong,
    ...ketQua,
  };
}

/**
 * Tính số sản phẩm của nhóm công đoạn lớn theo đúng quy tắc Mục 5:
 * - Chỉ xét các dòng ĐÃ NHẬP số sản phẩm (bỏ qua dòng để trống: null/undefined).
 * - Nếu các giá trị đã nhập giống nhau thì hiển thị giá trị đó.
 * - Nếu khác nhau thì để trống (trả về null).
 * - Nếu không dòng nào nhập thì hiển thị 1.
 */
export function tinhSoSanPhamNhom(
  danhSachDong: Pick<QuyTrinhChiTiet, 'so_san_pham'>[]
): number | null {
  const giaTriDaNhap: number[] = [];

  for (const dong of danhSachDong) {
    if (laSoDuongHopLe(dong.so_san_pham)) {
      giaTriDaNhap.push(Math.trunc(dong.so_san_pham));
    }
  }

  if (giaTriDaNhap.length === 0) {
    return 1;
  }

  const giaTriDauTien = giaTriDaNhap[0];
  const tatCaGiongNhau = giaTriDaNhap.every((val) => val === giaTriDauTien);

  return tatCaGiongNhau ? giaTriDauTien : null;
}

/**
 * Gom các dòng QuyTrinhChiTiet thành các nhóm NhomCongDoan theo cong_doan_id
 * để phục vụ Biểu mẫu Đơn giá (Mục 5 & Mục 8.2).
 *
 * Quy tắc gộp (Mục 5):
 * - Thứ tự nhóm giữ theo thứ tự xuất hiện đầu tiên của cong_doan_id trong quy trình.
 * - Số người nhóm = TỔNG so_nguoi các dòng trong nhóm.
 * - ST nhóm = TỔNG ST các dòng trong nhóm (không làm tròn trung gian).
 * - Đơn giá nhóm = TỔNG đơn giá các dòng trong nhóm (không làm tròn trung gian).
 * - Mức khoán nhóm = L × số người nhóm.
 * - Sản lượng pcs/1h, pcs/8h và Điều kiện làm việc của nhóm:
 *   nếu TẤT CẢ các dòng trong nhóm có cùng giá trị thì hiển thị giá trị đó;
 *   nếu khác nhau thì để trống (null).
 * - Số sản phẩm của nhóm: chỉ xét các dòng ĐÃ NHẬP số sản phẩm (bỏ qua dòng để trống).
 *   Nếu giống nhau -> hiển thị giá trị đó; khác nhau -> null (để trống); không dòng nào nhập -> 1.
 */
export function gopNhomCongDoan(
  danhSachDong: QuyTrinhChiTiet[],
  cauHinh: ThamSoTinhToan
): NhomCongDoan[] {
  const gioLamThang = cauHinh.gio_lam_thang ?? GIO_LAM_THANG_MAC_DINH;
  const luongTieuChuanGio = tinhLuongTieuChuanGio(
    cauHinh.luong_co_ban,
    gioLamThang
  );

  // Gom các dòng theo cong_doan_id và bảo toàn thứ tự xuất hiện của công đoạn lớn
  const thuTuCongDoanIds: number[] = [];
  const mapNhom = new Map<number, QuyTrinhChiTietKemTinhToan[]>();

  for (const dong of danhSachDong) {
    const dongDaTinh = tinhDongQuyTrinh(dong, cauHinh);
    const listHienTai = mapNhom.get(dong.cong_doan_id);
    if (!listHienTai) {
      thuTuCongDoanIds.push(dong.cong_doan_id);
      mapNhom.set(dong.cong_doan_id, [dongDaTinh]);
    } else {
      listHienTai.push(dongDaTinh);
    }
  }

  const ketQuaNhom: NhomCongDoan[] = [];

  for (const congDoanId of thuTuCongDoanIds) {
    const cacDong = mapNhom.get(congDoanId) ?? [];
    if (cacDong.length === 0) continue;

    const dongDau = cacDong[0];
    const tenCongDoan =
      dongDau.ten_cong_doan ?? `Công đoạn #${dongDau.cong_doan_id}`;

    // 1. Tổng số người của nhóm
    const soNguoiNhom = cacDong.reduce((sum, d) => sum + d.so_nguoi, 0);

    // 2. Mức khoán nhóm = L × số người nhóm
    const mucKhoanNhom = tinhLuongKhoan(cauHinh.luong_co_ban, soNguoiNhom);

    // 3. Kiểm tra lỗi chia cho 0 trong nhóm
    const coLoiChia0 = cacDong.some((d) => d.co_loi_chia_0);

    // 4. Tổng ST và Tổng Đơn giá của nhóm (cộng giá trị chính xác chưa làm tròn)
    const stNhom = coLoiChia0
      ? null
      : cacDong.reduce((sum, d) => sum + (d.st_giay ?? 0), 0);

    const donGiaVndNhom = coLoiChia0
      ? null
      : cacDong.reduce((sum, d) => sum + (d.don_gia_vnd ?? 0), 0);

    const donGiaUsdNhom =
      donGiaVndNhom === null
        ? null
        : tinhDonGiaUsd(donGiaVndNhom, cauHinh.ty_gia);

    // 5. Điều kiện làm việc của nhóm: tất cả giống nhau thì lấy, khác nhau thì để trống (null)
    const cungDieuKienId = cacDong.every(
      (d) => d.dieu_kien_id === dongDau.dieu_kien_id
    );
    const dieuKienIdNhom = cungDieuKienId ? dongDau.dieu_kien_id : null;

    const cungTenDieuKien =
      cungDieuKienId ||
      (Boolean(dongDau.ten_dieu_kien) &&
        cacDong.every((d) => d.ten_dieu_kien === dongDau.ten_dieu_kien));
    const tenDieuKienNhom = cungTenDieuKien
      ? (dongDau.ten_dieu_kien ?? null)
      : null;

    // 6. Sản lượng pcs/1h và pcs/8h của nhóm: tất cả các dòng có cùng san_luong_gio thì lấy, khác nhau thì null
    const cungSanLuong1h =
      !coLoiChia0 &&
      cacDong.every((d) => d.san_luong_gio === dongDau.san_luong_gio);
    const sanLuong1hNhom = cungSanLuong1h ? dongDau.san_luong_gio : null;
    const sanLuong8hNhom =
      sanLuong1hNhom !== null ? tinhSanLuong8h(sanLuong1hNhom) : null;

    // 7. Số sản phẩm của nhóm (bỏ qua dòng để trống)
    const soSanPhamNhom = tinhSoSanPhamNhom(cacDong);

    ketQuaNhom.push({
      cong_doan_id: congDoanId,
      ten_cong_doan: tenCongDoan,
      so_nguoi_nhom: soNguoiNhom,
      dieu_kien_id_nhom: dieuKienIdNhom,
      ten_dieu_kien_nhom: tenDieuKienNhom,
      so_san_pham_nhom: soSanPhamNhom,
      san_luong_1h_nhom: sanLuong1hNhom,
      san_luong_8h_nhom: sanLuong8hNhom,
      muc_khoan_nhom: mucKhoanNhom,
      thoi_gian_lam_viec_thang: gioLamThang,
      luong_tieu_chuan_gio: luongTieuChuanGio,
      don_gia_vnd_nhom: donGiaVndNhom,
      don_gia_usd_nhom: donGiaUsdNhom,
      st_nhom: stNhom,
      ghi_chu_nhom: null, // Biểu mẫu đơn giá gốc để trống cột Ghi chú nhóm (Mục 8.2)
      co_loi_chia_0: coLoiChia0,
      danh_sach_dong: cacDong,
    });
  }

  return ketQuaNhom;
}

/**
 * Tính dòng TOTAL cuối bảng của toàn bộ quy trình (Mục 5 - Tổng quy trình)
 */
export function tinhTongQuyTrinh(
  danhSachDong: QuyTrinhChiTiet[],
  cauHinh: ThamSoTinhToan
): TongQuyTrinh {
  if (danhSachDong.length === 0) {
    return {
      tong_so_nguoi: 0,
      tong_luong_khoan_thang: 0,
      tong_st_giay: 0,
      tong_don_gia_vnd: 0,
      tong_don_gia_usd: 0,
      co_loi_chia_0: false,
    };
  }

  const cacDongDaTinh = danhSachDong.map((d) => tinhDongQuyTrinh(d, cauHinh));
  const tongSoNguoi = cacDongDaTinh.reduce((sum, d) => sum + d.so_nguoi, 0);
  const tongLuongKhoanThang = tinhLuongKhoan(
    cauHinh.luong_co_ban,
    tongSoNguoi
  );
  const coLoiChia0 = cacDongDaTinh.some((d) => d.co_loi_chia_0);

  const tongStGiay = coLoiChia0
    ? null
    : cacDongDaTinh.reduce((sum, d) => sum + (d.st_giay ?? 0), 0);

  const tongDonGiaVnd = coLoiChia0
    ? null
    : cacDongDaTinh.reduce((sum, d) => sum + (d.don_gia_vnd ?? 0), 0);

  const tongDonGiaUsd =
    tongDonGiaVnd === null
      ? null
      : tinhDonGiaUsd(tongDonGiaVnd, cauHinh.ty_gia);

  return {
    tong_so_nguoi: tongSoNguoi,
    tong_luong_khoan_thang: tongLuongKhoanThang,
    tong_st_giay: tongStGiay,
    tong_don_gia_vnd: tongDonGiaVnd,
    tong_don_gia_usd: tongDonGiaUsd,
    co_loi_chia_0: coLoiChia0,
  };
}

/**
 * Định dạng số theo chuẩn Việt Nam (Mục 5):
 * - Dấu chấm (.) phân cách hàng nghìn, dấu phẩy (,) phân cách phần thập phân.
 * - Chỉ làm tròn khi hiển thị.
 * - Nếu giá trị là null / undefined / NaN (ví dụ lỗi chia cho 0) thì trả về "—" hoặc chuoiRong.
 */
export function dinhDangSoVN(
  giaTri: number | null | undefined,
  soChuSoThapPhan: number = 2,
  chuoiKhiRong: string = KY_HIEU_CHIA_0
): string {
  if (giaTri === null || giaTri === undefined || !Number.isFinite(giaTri)) {
    return chuoiKhiRong;
  }

  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: soChuSoThapPhan,
  }).format(giaTri);
}

/**
 * Định dạng số có cố định chữ số thập phân theo chuẩn Việt Nam (ví dụ ST hoặc Đơn giá: 1,97; 243,27)
 */
export function dinhDangThapPhanCoDinhVN(
  giaTri: number | null | undefined,
  soChuSoThapPhan: number = 2,
  chuoiKhiRong: string = KY_HIEU_CHIA_0
): string {
  if (giaTri === null || giaTri === undefined || !Number.isFinite(giaTri)) {
    return chuoiKhiRong;
  }

  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: soChuSoThapPhan,
    maximumFractionDigits: soChuSoThapPhan,
  }).format(giaTri);
}
