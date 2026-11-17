export type VaiTro = 'xem' | 'sua';

export interface TruongKiemVet {
  nguoi_tao?: string | null;
  nguoi_sua?: string | null;
  thoi_diem_tao?: string;
  thoi_diem_sua?: string;
}

export interface TruongXoaMem {
  da_xoa: boolean;
  thoi_diem_xoa?: string | null;
  nguoi_xoa?: string | null;
}

export interface NguoiDung extends TruongKiemVet {
  id: string;
  ho_ten: string;
  email: string;
  vai_tro: VaiTro;
  da_vo_hieu_hoa: boolean;
}

export interface SanPham extends TruongKiemVet, TruongXoaMem {
  ma_hang: string;
  ten_hang?: string | null;
  quy_cach?: string | null;
  khach_hang?: string | null;
  line?: string | null;
  hinh_anh?: string | null;
}

export interface CongDoan extends TruongKiemVet, TruongXoaMem {
  id: number;
  ten_cong_doan: string;
}

export interface CongDoanChiTiet extends TruongKiemVet, TruongXoaMem {
  id: number;
  ten_cong_doan_chi_tiet: string;
}

export interface ThietBi extends TruongKiemVet, TruongXoaMem {
  id: number;
  ten_thiet_bi: string;
  hinh_anh?: string | null;
}

export interface Jig extends TruongKiemVet, TruongXoaMem {
  id: number;
  ten_jig: string;
  hinh_anh?: string | null;
}

export interface DieuKienLamViec extends TruongKiemVet, TruongXoaMem {
  id: number;
  ten_dieu_kien: string;
}

export interface CauHinhChung extends TruongKiemVet {
  id: number;
  luong_co_ban: number;
  ty_gia: number;
  gio_lam_thang: number;
  hieu_luc_tu: string;
}

export interface ThamSoTinhToan {
  luong_co_ban: number;
  ty_gia: number;
  gio_lam_thang?: number;
}

export interface QuyTrinh extends TruongKiemVet {
  ma_hang: string;
  rev: string;
  ngay_lap: string;
  ly_do_thay_doi?: string | null;
}

export interface QuyTrinhChiTiet extends TruongKiemVet {
  id?: number;
  ma_hang: string;
  rev: string;
  stt: number;
  cong_doan_id: number;
  cong_doan_chi_tiet_id: number;
  thao_tac?: string | null;
  thiet_bi_id?: number | null;
  jig_id?: number | null;
  so_san_pham?: number | null;
  dieu_kien_id: number;
  so_nguoi: number;
  san_luong_gio: number;
  ghi_chu?: string | null;
  ten_cong_doan?: string;
  ten_cong_doan_chi_tiet?: string;
  ten_thiet_bi?: string | null;
  ten_jig?: string | null;
  ten_dieu_kien?: string;
}

export interface KetQuaTinhDong {
  so_san_pham_hien_thi: number;
  luong_khoan_thang: number;
  luong_tieu_chuan_gio: number;
  san_luong_8h: number | null;
  st_giay: number | null;
  don_gia_vnd: number | null;
  don_gia_usd: number | null;
  co_loi_chia_0: boolean;
  thong_bao_loi?: string | null;
}

export interface QuyTrinhChiTietKemTinhToan extends QuyTrinhChiTiet, KetQuaTinhDong {}

export interface NhomCongDoan {
  cong_doan_id: number;
  ten_cong_doan: string;
  so_nguoi_nhom: number;
  dieu_kien_id_nhom: number | null;
  ten_dieu_kien_nhom: string | null;
  so_san_pham_nhom: number | null;
  san_luong_1h_nhom: number | null;
  san_luong_8h_nhom: number | null;
  muc_khoan_nhom: number;
  thoi_gian_lam_viec_thang: number;
  luong_tieu_chuan_gio: number;
  don_gia_vnd_nhom: number | null;
  don_gia_usd_nhom: number | null;
  st_nhom: number | null;
  ghi_chu_nhom: string | null;
  co_loi_chia_0: boolean;
  danh_sach_dong: QuyTrinhChiTietKemTinhToan[];
}

export interface TongQuyTrinh {
  tong_so_nguoi: number;
  tong_luong_khoan_thang: number;
  tong_st_giay: number | null;
  tong_don_gia_vnd: number | null;
  tong_don_gia_usd: number | null;
  co_loi_chia_0: boolean;
}