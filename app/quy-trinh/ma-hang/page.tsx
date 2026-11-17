'use client';

/**
 * Màn hình chi tiết quy trình sản xuất của một mã hàng
 * Đường dẫn: app/quy-trinh/[ma_hang]/page.tsx
 * Tuân thủ Mục 6, Mục 9B, 9C, 9D, Mục 11 và Mục 14.2 của PRD:
 * - Quản lý state danh sách dòng quy trình (QuyTrinhChiTiet[]) và các danh mục.
 * - Hiển thị responsive: Bảng 13 cột trên PC (hidden md:block) và Thẻ nhập liệu trên Mobile (block md:hidden).
 * - Hiển thị thông tin đầu trang: Mã hàng, Tên hàng, REV hiện tại, Ngày lập, Lương cơ bản & Tỷ giá.
 * - Nút "Tạo REV mới" ghi console.log khi bấm.
 * - Hàm fetchData() giả lập trả về 3 dòng quy trình mẫu khớp số liệu kiểm tra Mục 5 & Mục 11 PRD.
 */

import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  GitBranchPlus,
  History,
  Layers,
  Plus,
  Save,
  Calendar,
  Package,
  CheckCircle2,
} from 'lucide-react';
import { BangNhap } from '../../../components/bang-nhap-quy-trinh/BangNhap';
import { TheNhapLieu } from '../../../components/the-quy-trinh/TheNhapLieu';
import {
  dinhDangSoVN,
  dinhDangThapPhanCoDinhVN,
  tinhTongQuyTrinh,
} from '../../../lib/cong-thuc/tinh-toan';
import {
  xuatBieuMauDonGia,
  xuatBieuMauQuyTrinh,
} from '../../../lib/xuat/xuat-excel';
import type {
  CongDoan,
  CongDoanChiTiet,
  DieuKienLamViec,
  Jig,
  QuyTrinh,
  QuyTrinhChiTiet,
  SanPham,
  ThamSoTinhToan,
  ThietBi,
} from '../../../lib/doi-tuong/types';

/** Kiểu dữ liệu trả về từ hàm fetchData giả lập */
interface DuLieuManHinhQuyTrinh {
  sanPham: SanPham;
  quyTrinh: QuyTrinh;
  cauHinh: ThamSoTinhToan;
  danhSachCongDoan: CongDoan[];
  danhSachCongDoanChiTiet: CongDoanChiTiet[];
  danhSachThietBi: ThietBi[];
  danhSachJig: Jig[];
  danhSachDieuKien: DieuKienLamViec[];
  danhSachDong: QuyTrinhChiTiet[];
}

/**
 * Hàm giả lập (mock) tải dữ liệu quy trình và danh mục theo mã hàng (Mục 5 & Mục 11 PRD)
 */
async function fetchData(maHang: string): Promise<DuLieuManHinhQuyTrinh> {
  // Giả lập độ trễ mạng nhẹ
  await new Promise((resolve) => setTimeout(resolve, 150));

  const maHangChuan = maHang || 'EED89001130AA';

  const sanPham: SanPham = {
    ma_hang: maHangChuan,
    ten_hang: 'FLYBACK_TRANSFORMER_EFD25',
    quy_cach: 'EFD25',
    khach_hang: 'VINFAST',
    line: 'LINE-01',
    da_xoa: false,
  };

  const quyTrinh: QuyTrinh = {
    ma_hang: maHangChuan,
    rev: 'A1',
    ngay_lap: '2026-10-29',
    ly_do_thay_doi: 'Thiết lập quy trình sản xuất lần đầu cho mã hàng mới',
  };

  // Cấu hình lương cơ bản và tỷ giá mẫu theo Mục 5 & Mục 11 PRD
  const cauHinh: ThamSoTinhToan = {
    luong_co_ban: 5_060_000,
    ty_gia: 26_000,
    gio_lam_thang: 208,
  };

  const danhSachCongDoan: CongDoan[] = [
    { id: 1, ten_cong_doan: 'Mài laser', da_xoa: false },
    { id: 2, ten_cong_doan: 'Quấn dây', da_xoa: false },
    { id: 3, ten_cong_doan: 'Hàn', da_xoa: false },
    { id: 4, ten_cong_doan: 'Lắp ráp', da_xoa: false },
    { id: 5, ten_cong_doan: 'Nhỏ Epoxy', da_xoa: false },
    { id: 6, ten_cong_doan: 'KTHT', da_xoa: false },
  ];

  const danhSachCongDoanChiTiet: CongDoanChiTiet[] = [
    { id: 101, ten_cong_doan_chi_tiet: 'Mài Core', da_xoa: false },
    { id: 102, ten_cong_doan_chi_tiet: 'Quấn dây W1', da_xoa: false },
    { id: 103, ten_cong_doan_chi_tiet: 'Xếp Jig Hàn', da_xoa: false },
    { id: 104, ten_cong_doan_chi_tiet: 'Hàn chân pin', da_xoa: false },
    { id: 105, ten_cong_doan_chi_tiet: 'Nắn chân pin', da_xoa: false },
    {
      id: 106,
      ten_cong_doan_chi_tiet: 'Kiểm tra cách điện Coil-Core',
      da_xoa: false,
    },
  ];

  const danhSachThietBi: ThietBi[] = [
    { id: 201, ten_thiet_bi: 'Máy mài Core tự động', da_xoa: false },
    { id: 202, ten_thiet_bi: 'Máy quấn dây CNC 8 trục', da_xoa: false },
    { id: 203, ten_thiet_bi: 'Bể hàn thiếc tự động', da_xoa: false },
    { id: 204, ten_thiet_bi: 'Máy Hi-Pot Chroma 19073', da_xoa: false },
  ];

  const danhSachJig: Jig[] = [
    { id: 301, ten_jig: 'JIG mài Core EFD25', da_xoa: false },
    { id: 302, ten_jig: 'JIG quấn dây EFD25-8P', da_xoa: false },
    { id: 303, ten_jig: 'JIG kẹp hàn 12 sản phẩm', da_xoa: false },
  ];

  const danhSachDieuKien: DieuKienLamViec[] = [
    { id: 1, ten_dieu_kien: 'Manual', da_xoa: false },
    { id: 2, ten_dieu_kien: 'Auto', da_xoa: false },
    { id: 3, ten_dieu_kien: 'Semi Auto', da_xoa: false },
    { id: 4, ten_dieu_kien: 'Auto 1 trục', da_xoa: false },
    { id: 5, ten_dieu_kien: 'Auto 8 trục', da_xoa: false },
  ];

  // 3 dòng quy trình mẫu khớp chính xác số liệu kiểm tra trong Mục 5 PRD:
  // - Dòng 1: Mài Core, 3 người, 5.480 pcs/giờ -> ST = 1,97 s
  // - Dòng 2: Quấn dây W1, 1 người, 100 pcs/giờ -> ST = 36,00 s, Đơn giá = 243,27 VNĐ
  // - Dòng 3: Hàn chân pin, Số SP = 12, 1.5 người, 1.500 pcs/giờ -> ST = 3,60 s
  const danhSachDong: QuyTrinhChiTiet[] = [
    {
      id: 1,
      ma_hang: maHangChuan,
      rev: 'A1',
      stt: 1,
      cong_doan_id: 1,
      cong_doan_chi_tiet_id: 101,
      thao_tac: 'Đặt Core vào JIG và mài phẳng khe từ',
      thiet_bi_id: 201,
      jig_id: 301,
      so_san_pham: 6,
      dieu_kien_id: 3,
      so_nguoi: 3,
      san_luong_gio: 5480,
      ghi_chu: 'Core EFD25',
    },
    {
      id: 2,
      ma_hang: maHangChuan,
      rev: 'A1',
      stt: 2,
      cong_doan_id: 2,
      cong_doan_chi_tiet_id: 102,
      thao_tac: 'Quấn cuộn sơ cấp W1 (0.25mm x 42Ts)',
      thiet_bi_id: 202,
      jig_id: 302,
      so_san_pham: 8,
      dieu_kien_id: 5,
      so_nguoi: 1,
      san_luong_gio: 100,
      ghi_chu: 'W1',
    },
    {
      id: 3,
      ma_hang: maHangChuan,
      rev: 'A1',
      stt: 3,
      cong_doan_id: 3,
      cong_doan_chi_tiet_id: 104,
      thao_tac: 'Nhúng hàn chân Pin nhiệt độ 380°C trong 2s',
      thiet_bi_id: 203,
      jig_id: 303,
      so_san_pham: 12,
      dieu_kien_id: 1,
      so_nguoi: 1.5,
      san_luong_gio: 1500,
      ghi_chu: 'Kẹp 12 pcs/JIG',
    },
  ];

  return {
    sanPham,
    quyTrinh,
    cauHinh,
    danhSachCongDoan,
    danhSachCongDoanChiTiet,
    danhSachThietBi,
    danhSachJig,
    danhSachDieuKien,
    danhSachDong,
  };
}

export interface TrangChiTietQuyTrinhProps {
  params?: {
    ma_hang?: string;
  };
}

export default function TrangChiTietQuyTrinh({
  params,
}: TrangChiTietQuyTrinhProps) {
  const maHangParam = params?.ma_hang ?? 'EED89001130AA';

  const [dangTai, setDangTai] = useState<boolean>(true);
  const [thongBao, setThongBao] = useState<string | null>(null);

  // State lưu thông tin đầu trang quy trình & cấu hình chung
  const [sanPham, setSanPham] = useState<SanPham>({
    ma_hang: maHangParam,
    ten_hang: 'FLYBACK_TRANSFORMER_EFD25',
    quy_cach: 'EFD25',
    khach_hang: 'VINFAST',
    da_xoa: false,
  });

  const [quyTrinh, setQuyTrinh] = useState<QuyTrinh>({
    ma_hang: maHangParam,
    rev: 'A1',
    ngay_lap: '2026-10-29',
  });

  const [cauHinh, setCauHinh] = useState<ThamSoTinhToan>({
    luong_co_ban: 5_060_000,
    ty_gia: 26_000,
    gio_lam_thang: 208,
  });

  // State lưu danh sách các dòng quy trình chi tiết và các danh mục
  const [danhSachDong, setDanhSachDong] = useState<QuyTrinhChiTiet[]>([]);
  const [danhSachCongDoan, setDanhSachCongDoan] = useState<CongDoan[]>([]);
  const [danhSachCongDoanChiTiet, setDanhSachCongDoanChiTiet] = useState<
    CongDoanChiTiet[]
  >([]);
  const [danhSachThietBi, setDanhSachThietBi] = useState<ThietBi[]>([]);
  const [danhSachJig, setDanhSachJig] = useState<Jig[]>([]);
  const [danhSachDieuKien, setDanhSachDieuKien] = useState<DieuKienLamViec[]>(
    []
  );

  // Tải dữ liệu mẫu khi mở trang
  useEffect(() => {
    let active = true;
    setDangTai(true);

    fetchData(maHangParam)
      .then((data) => {
        if (!active) return;
        setSanPham(data.sanPham);
        setQuyTrinh(data.quyTrinh);
        setCauHinh(data.cauHinh);
        setDanhSachCongDoan(data.danhSachCongDoan);
        setDanhSachCongDoanChiTiet(data.danhSachCongDoanChiTiet);
        setDanhSachThietBi(data.danhSachThietBi);
        setDanhSachJig(data.danhSachJig);
        setDanhSachDieuKien(data.danhSachDieuKien);
        setDanhSachDong(data.danhSachDong);
      })
      .finally(() => {
        if (active) setDangTai(false);
      });

    return () => {
      active = false;
    };
  }, [maHangParam]);

  // Đánh lại số thứ tự STT liên tục (1, 2, 3...) sau khi xóa hoặc đổi vị trí dòng
  const capNhatLaiStt = (cacDong: QuyTrinhChiTiet[]): QuyTrinhChiTiet[] =>
    cacDong.map((dong, idx) => ({
      ...dong,
      stt: idx + 1,
    }));

  // 1. Xử lý khi người dùng sửa một ô trong dòng
  const handleRowChange = (index: number, dongMoi: QuyTrinhChiTiet) => {
    setDanhSachDong((prev) => {
      const next = [...prev];
      next[index] = dongMoi;
      return next;
    });
  };

  // 2. Xử lý xóa một dòng
  const handleRowDelete = (index: number) => {
    setDanhSachDong((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      return capNhatLaiStt(next);
    });
  };

  // 3. Xử lý di chuyển dòng lên trên
  const handleRowMoveUp = (index: number) => {
    if (index <= 0) return;
    setDanhSachDong((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return capNhatLaiStt(next);
    });
  };

  // 4. Xử lý di chuyển dòng xuống dưới
  const handleRowMoveDown = (index: number) => {
    setDanhSachDong((prev) => {
      if (index < 0 || index >= prev.length - 1) return prev;
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return capNhatLaiStt(next);
    });
  };

  // 5. Xử lý thêm dòng mới vào cuối bảng
  const handleAddRow = () => {
    setDanhSachDong((prev) => {
      const sttMoi = prev.length + 1;
      const dongMoi: QuyTrinhChiTiet = {
        id: Date.now(),
        ma_hang: sanPham.ma_hang,
        rev: quyTrinh.rev,
        stt: sttMoi,
        cong_doan_id: danhSachCongDoan[0]?.id ?? 0,
        cong_doan_chi_tiet_id: danhSachCongDoanChiTiet[0]?.id ?? 0,
        thao_tac: '',
        thiet_bi_id: null,
        jig_id: null,
        so_san_pham: null,
        dieu_kien_id: danhSachDieuKien[0]?.id ?? 1,
        so_nguoi: 1,
        san_luong_gio: 1000,
        ghi_chu: '',
      };
      return [...prev, dongMoi];
    });
  };

  // 6. Xử lý bấm nút "Tạo REV mới" (Yêu cầu 4: in ra console.log)
  const handleTaoRevMoi = () => {
    console.log('Bấm nút Tạo REV mới cho mã hàng:', {
      ma_hang: sanPham.ma_hang,
      rev_hien_tai: quyTrinh.rev,
      so_dong_sao_chep: danhSachDong.length,
    });
    setThongBao(
      `Đã ghi nhận lệnh "Tạo REV mới" từ REV ${quyTrinh.rev} (xem chi tiết trong Console).`
    );
  };

  // 7. Ghép tên danh mục vào từng dòng trước khi xuất ra Excel
  const chuanBiDongXuatExcel = (): QuyTrinhChiTiet[] =>
    danhSachDong.map((dong) => ({
      ...dong,
      ten_cong_doan:
        danhSachCongDoan.find((cd) => cd.id === dong.cong_doan_id)
          ?.ten_cong_doan ?? dong.ten_cong_doan,
      ten_cong_doan_chi_tiet:
        danhSachCongDoanChiTiet.find(
          (ct) => ct.id === dong.cong_doan_chi_tiet_id
        )?.ten_cong_doan_chi_tiet ?? dong.ten_cong_doan_chi_tiet,
      ten_thiet_bi:
        danhSachThietBi.find((tb) => tb.id === dong.thiet_bi_id)
          ?.ten_thiet_bi ?? null,
      ten_jig:
        danhSachJig.find((j) => j.id === dong.jig_id)?.ten_jig ?? null,
      ten_dieu_kien:
        danhSachDieuKien.find((dk) => dk.id === dong.dieu_kien_id)
          ?.ten_dieu_kien ?? dong.ten_dieu_kien,
    }));

  // 8. Sự kiện onClick Xuất Excel Biểu mẫu Quy trình (Mục 8.1)
  const handleXuatExcelQuyTrinh = async () => {
    await xuatBieuMauQuyTrinh(chuanBiDongXuatExcel(), cauHinh, {
      ma_hang: sanPham.ma_hang,
      ten_hang: sanPham.ten_hang,
      quy_cach: sanPham.quy_cach,
      khach_hang: sanPham.khach_hang,
      rev: quyTrinh.rev,
      ngay_lap: quyTrinh.ngay_lap,
    });
    setThongBao('Đã xuất file Excel Biểu mẫu Quy trình sản xuất.');
  };

  // 9. Sự kiện onClick Xuất Excel Biểu mẫu Đơn giá (Mục 8.2)
  const handleXuatExcelDonGia = async () => {
    await xuatBieuMauDonGia(chuanBiDongXuatExcel(), cauHinh, {
      ma_hang: sanPham.ma_hang,
      ten_hang: sanPham.ten_hang,
      quy_cach: sanPham.quy_cach,
      khach_hang: sanPham.khach_hang,
      rev: quyTrinh.rev,
      ngay_lap: quyTrinh.ngay_lap,
    });
    setThongBao('Đã xuất file Excel Biểu mẫu Đơn giá công đoạn.');
  };

  const tongQuyTrinh = tinhTongQuyTrinh(danhSachDong, cauHinh);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Thanh tiêu đề trên cùng */}
      <header className="border-b border-slate-200 bg-[#14539E] text-white shadow-sm">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-blue-100">
                Hệ thống Quản lý Quy trình Sản xuất (AppST)
              </p>
              <h1 className="text-lg font-bold tracking-tight sm:text-xl">
                Chi tiết Quy trình Mã hàng: {sanPham.ma_hang}
              </h1>
            </div>
          </div>

          {/* Các nút thao tác cấp quy trình (Mục 9B) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleTaoRevMoi}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-sm transition hover:bg-amber-300"
            >
              <GitBranchPlus className="h-4 w-4" />
              Tạo REV mới
            </button>

            <button
              type="button"
              onClick={() =>
                console.log('Xem lịch sử REV của mã hàng:', sanPham.ma_hang)
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              <History className="h-4 w-4" />
              Lịch sử REV
            </button>

            <button
              type="button"
              onClick={handleXuatExcelQuyTrinh}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Xuất Excel Quy trình
            </button>

            <button
              type="button"
              onClick={handleXuatExcelDonGia}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-teal-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-500"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Xuất Excel Đơn giá
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-5 px-4 py-5 sm:px-6">
        {/* Thông báo phản hồi khi bấm nút */}
        {thongBao && (
          <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-medium text-[#14539E]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{thongBao}</span>
            </div>
            <button
              type="button"
              onClick={() => setThongBao(null)}
              className="text-xs font-bold underline"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Khối thông tin đầu trang quy trình: Tên mã hàng, REV hiện tại, Ngày lập, Cấu hình */}
        <section
          aria-label="Thông tin chung của mã hàng và quy trình"
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Mã hàng & Tên hàng */}
            <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Package className="h-3.5 w-3.5 text-[#14539E]" />
                <span>Mã hàng & Tên sản phẩm</span>
              </div>
              <p className="mt-1 font-mono text-base font-bold text-[#14539E]">
                {sanPham.ma_hang}
              </p>
              <p className="truncate text-xs font-semibold text-slate-800">
                {sanPham.ten_hang}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Khách hàng: <strong>{sanPham.khach_hang}</strong> | Quy cách:{' '}
                <strong>{sanPham.quy_cach}</strong>
              </p>
            </div>

            {/* REV hiện tại & Ngày lập */}
            <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Calendar className="h-3.5 w-3.5 text-[#14539E]" />
                <span>Phiên bản quy trình (REV)</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-[#14539E] px-2.5 py-0.5 font-mono text-sm font-bold text-white">
                  REV {quyTrinh.rev}
                </span>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                  Đang mở sửa
                </span>
              </div>
              <p className="mt-1.5 text-xs text-slate-700">
                Ngày lập: <strong>{quyTrinh.ngay_lap}</strong>
              </p>
            </div>

            {/* Thông số cấu hình Lương cơ bản & Tỷ giá */}
            <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
              <p className="text-xs font-medium text-slate-500">
                Cấu hình lương & tỷ giá áp dụng
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-slate-900">
                Lương CB: {dinhDangSoVN(cauHinh.luong_co_ban, 0)} VNĐ
              </p>
              <p className="mt-0.5 font-mono text-xs text-slate-600">
                Tỷ giá: {dinhDangSoVN(cauHinh.ty_gia, 0)} VNĐ/USD | Giờ chuẩn:{' '}
                {cauHinh.gio_lam_thang ?? 208}h
              </p>
            </div>

            {/* Tóm tắt nhanh Tổng ST & Tổng Đơn giá */}
            <div className="rounded-lg border border-[#14539E]/20 bg-blue-50/50 p-3">
              <p className="text-xs font-semibold text-[#14539E]">
                Tổng kết quy trình ({danhSachDong.length} công đoạn)
              </p>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xs text-slate-600">Tổng ST:</span>
                <span className="font-mono text-sm font-bold text-[#14539E]">
                  {dinhDangThapPhanCoDinhVN(tongQuyTrinh.tong_st_giay, 2)} s
                </span>
              </div>
              <div className="mt-0.5 flex items-baseline justify-between">
                <span className="text-xs text-slate-600">Tổng Đơn giá:</span>
                <span className="font-mono text-sm font-bold text-[#14539E]">
                  {dinhDangThapPhanCoDinhVN(tongQuyTrinh.tong_don_gia_vnd, 2)}{' '}
                  VNĐ
                </span>
              </div>
              <div className="mt-0.5 flex items-baseline justify-between">
                <span className="text-xs text-slate-600">Tổng số người:</span>
                <span className="font-mono text-xs font-semibold text-slate-800">
                  {dinhDangSoVN(tongQuyTrinh.tong_so_nguoi, 2)} người
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Thanh tiêu đề bảng nhập chi tiết */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">
              Danh sách công đoạn sản xuất chi tiết
            </h2>
            <p className="text-xs text-slate-500">
              ST (giây) và Đơn giá (VNĐ/pcs) được hệ thống tự động tính ngay khi
              nhập Số người và Sản lượng/giờ.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddRow}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#14539E] bg-white px-3 py-1.5 text-xs font-semibold text-[#14539E] transition hover:bg-blue-50"
            >
              <Plus className="h-4 w-4" />
              Thêm dòng
            </button>
            <button
              type="button"
              onClick={() => {
                console.log('Lưu dữ liệu quy trình:', {
                  quyTrinh,
                  danhSachDong,
                });
                setThongBao('Đã kiểm tra hợp lệ dữ liệu quy trình.');
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#14539E] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0f3f7a]"
            >
              <Save className="h-4 w-4" />
              Lưu quy trình
            </button>
          </div>
        </div>

        {/* Nội dung chính: Bảng 13 cột cho PC (hidden md:block) và Thẻ cho Mobile (block md:hidden) */}
        {dangTai ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
            Đang tải dữ liệu quy trình sản xuất...
          </div>
        ) : (
          <>
            {/* Giao diện Máy tính (Desktop) */}
            <div className="hidden md:block">
              <BangNhap
                danhSachDong={danhSachDong}
                danhSachCongDoan={danhSachCongDoan}
                danhSachCongDoanChiTiet={danhSachCongDoanChiTiet}
                danhSachThietBi={danhSachThietBi}
                danhSachJig={danhSachJig}
                danhSachDieuKien={danhSachDieuKien}
                cauHinh={cauHinh}
                tongQuyTrinh={tongQuyTrinh}
                onChange={handleRowChange}
                onDelete={handleRowDelete}
                onMoveUp={handleRowMoveUp}
                onMoveDown={handleRowMoveDown}
                onAddRow={handleAddRow}
              />
            </div>

            {/* Giao diện Điện thoại (Mobile) */}
            <div className="block md:hidden">
              <TheNhapLieu
                danhSachDong={danhSachDong}
                danhSachCongDoan={danhSachCongDoan}
                danhSachCongDoanChiTiet={danhSachCongDoanChiTiet}
                danhSachThietBi={danhSachThietBi}
                danhSachJig={danhSachJig}
                danhSachDieuKien={danhSachDieuKien}
                cauHinh={cauHinh}
                tongQuyTrinh={tongQuyTrinh}
                onChange={handleRowChange}
                onDelete={handleRowDelete}
                onMoveUp={handleRowMoveUp}
                onMoveDown={handleRowMoveDown}
                onAddRow={handleAddRow}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
