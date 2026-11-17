/**
 * Component Thẻ nhập liệu quy trình chi tiết dành cho Điện thoại (Mobile Card View)
 * Tuân thủ Mục 9D và Mục 14.2 của PRD:
 * - Dumb Component (thuần hiển thị): không gọi trực tiếp cơ sở dữ liệu (lib/supabase).
 * - Mỗi dòng quy trình hiển thị thành một THẺ (Card) độc lập, các trường xếp dọc.
 * - Góc trên mỗi thẻ có nút mũi tên Lên/Xuống để đổi thứ tự và nút Xóa.
 * - Các ô input/select cao tối thiểu 44px, dễ chạm; bàn phím số tự hiện khi nhập
 *   số người, sản lượng, số sản phẩm (inputMode="decimal" / "numeric").
 */

import React from 'react';
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  AlertCircle,
  Calculator,
} from 'lucide-react';
import type {
  CongDoan,
  CongDoanChiTiet,
  DieuKienLamViec,
  Jig,
  QuyTrinhChiTiet,
  ThamSoTinhToan,
  ThietBi,
  TongQuyTrinh,
} from '@/lib/doi-tuong/types';
import {
  dinhDangSoVN,
  dinhDangThapPhanCoDinhVN,
  tinhDongQuyTrinh,
  tinhTongQuyTrinh,
} from '@/lib/cong-thuc/tinh-toan';

export interface TheNhapLieuProps {
  danhSachDong: QuyTrinhChiTiet[];
  danhSachCongDoan: CongDoan[];
  danhSachCongDoanChiTiet: CongDoanChiTiet[];
  danhSachThietBi: ThietBi[];
  danhSachJig: Jig[];
  danhSachDieuKien: DieuKienLamViec[];
  cauHinh: ThamSoTinhToan;
  tongQuyTrinh?: TongQuyTrinh;
  chiXem?: boolean;
  onChange: (index: number, dongMoi: QuyTrinhChiTiet) => void;
  onDelete: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onAddRow?: () => void;
}

export const TheNhapLieu: React.FC<TheNhapLieuProps> = ({
  danhSachDong,
  danhSachCongDoan,
  danhSachCongDoanChiTiet,
  danhSachThietBi,
  danhSachJig,
  danhSachDieuKien,
  cauHinh,
  tongQuyTrinh,
  chiXem = false,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAddRow,
}) => {
  const tong = tongQuyTrinh ?? tinhTongQuyTrinh(danhSachDong, cauHinh);

  const handleFieldChange = <K extends keyof QuyTrinhChiTiet>(
    index: number,
    field: K,
    value: QuyTrinhChiTiet[K]
  ) => {
    if (chiXem) return;
    const dongHienTai = danhSachDong[index];
    onChange(index, {
      ...dongHienTai,
      [field]: value,
    });
  };

  return (
    <div className="w-full space-y-4 pb-20">
      {/* Thẻ tóm tắt TOTAL trên điện thoại */}
      <div className="rounded-xl border border-[#14539E]/20 bg-[#14539E] p-4 text-white shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-100">
            <Calculator className="h-4 w-4" />
            Tổng cộng quy trình ({danhSachDong.length} dòng)
          </span>
          <span className="rounded bg-white/15 px-2 py-0.5 font-mono text-xs">
            {dinhDangThapPhanCoDinhVN(tong.tong_don_gia_usd, 4)} USD
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 border-t border-white/15 pt-2.5 text-center">
          <div>
            <p className="text-[11px] text-blue-100">Tổng số người</p>
            <p className="font-mono text-base font-bold">
              {dinhDangSoVN(tong.tong_so_nguoi, 2)}
            </p>
          </div>
          <div className="border-x border-white/15 px-1">
            <p className="text-[11px] text-blue-100">Tổng ST (s)</p>
            <p className="font-mono text-base font-bold">
              {dinhDangThapPhanCoDinhVN(tong.tong_st_giay, 2)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-blue-100">Tổng Đơn giá (VNĐ)</p>
            <p className="font-mono text-base font-bold">
              {dinhDangThapPhanCoDinhVN(tong.tong_don_gia_vnd, 2)}
            </p>
          </div>
        </div>
      </div>

      {/* Danh sách các thẻ công đoạn */}
      {danhSachDong.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          Chưa có dòng công đoạn nào. Nhấn nút <strong>+ Thêm dòng</strong> để
          bắt đầu nhập liệu.
        </div>
      ) : (
        danhSachDong.map((dong, index) => {
          const ketQua = tinhDongQuyTrinh(dong, cauHinh);
          const loiSanLuong = ketQua.co_loi_chia_0;

          return (
            <div
              key={dong.id ?? `${dong.stt}-${index}`}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              {/* Đầu thẻ: STT + Nút Lên / Xuống / Xóa ở góc thẻ */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#14539E] text-xs font-bold text-white">
                    {dong.stt || index + 1}
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    Dòng công đoạn #{dong.stt || index + 1}
                  </span>
                </div>

                {!chiXem && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Di chuyển lên thẻ ${index + 1}`}
                      disabled={index === 0}
                      onClick={() => onMoveUp(index)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 active:bg-slate-100 disabled:opacity-30"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Di chuyển xuống thẻ ${index + 1}`}
                      disabled={index === danhSachDong.length - 1}
                      onClick={() => onMoveDown(index)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 active:bg-slate-100 disabled:opacity-30"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Xóa thẻ ${index + 1}`}
                      onClick={() => onDelete(index)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 active:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Thân thẻ: Các trường dữ liệu xếp theo chiều dọc */}
              <div className="space-y-3.5 p-3.5">
                {/* 1. Công đoạn lớn */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Công đoạn lớn <span className="text-red-500">*</span>
                  </label>
                  <select
                    aria-label={`Công đoạn lớn thẻ ${index + 1}`}
                    disabled={chiXem}
                    value={dong.cong_doan_id || ''}
                    onChange={(e) =>
                      handleFieldChange(
                        index,
                        'cong_doan_id',
                        Number(e.target.value)
                      )
                    }
                    className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#14539E] focus:outline-none disabled:bg-slate-100"
                  >
                    <option value="">-- Chọn công đoạn lớn --</option>
                    {danhSachCongDoan.map((cd) => (
                      <option key={cd.id} value={cd.id}>
                        {cd.ten_cong_doan}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Công đoạn chi tiết */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Công đoạn chi tiết <span className="text-red-500">*</span>
                  </label>
                  <select
                    aria-label={`Công đoạn chi tiết thẻ ${index + 1}`}
                    disabled={chiXem}
                    value={dong.cong_doan_chi_tiet_id || ''}
                    onChange={(e) =>
                      handleFieldChange(
                        index,
                        'cong_doan_chi_tiet_id',
                        Number(e.target.value)
                      )
                    }
                    className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#14539E] focus:outline-none disabled:bg-slate-100"
                  >
                    <option value="">-- Chọn công đoạn chi tiết --</option>
                    {danhSachCongDoanChiTiet.map((ct) => (
                      <option key={ct.id} value={ct.id}>
                        {ct.ten_cong_doan_chi_tiet}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Thao tác chi tiết */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Thao tác chi tiết
                  </label>
                  <input
                    type="text"
                    aria-label={`Thao tác thẻ ${index + 1}`}
                    disabled={chiXem}
                    placeholder="VD: AC 3.0kV, 3sec, 1mA"
                    value={dong.thao_tac ?? ''}
                    onChange={(e) =>
                      handleFieldChange(index, 'thao_tac', e.target.value)
                    }
                    className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#14539E] focus:outline-none disabled:bg-slate-100"
                  />
                </div>

                {/* 4. Thiết bị & JIG */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Thiết bị (Trống = Thủ công)
                    </label>
                    <select
                      aria-label={`Thiết bị thẻ ${index + 1}`}
                      disabled={chiXem}
                      value={dong.thiet_bi_id ?? ''}
                      onChange={(e) =>
                        handleFieldChange(
                          index,
                          'thiet_bi_id',
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#14539E] focus:outline-none disabled:bg-slate-100"
                    >
                      <option value="">Thủ công (Không dùng máy)</option>
                      {danhSachThietBi.map((tb) => (
                        <option key={tb.id} value={tb.id}>
                          {tb.ten_thiet_bi}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      JIG (Trống = Không dùng JIG)
                    </label>
                    <select
                      aria-label={`JIG thẻ ${index + 1}`}
                      disabled={chiXem}
                      value={dong.jig_id ?? ''}
                      onChange={(e) =>
                        handleFieldChange(
                          index,
                          'jig_id',
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#14539E] focus:outline-none disabled:bg-slate-100"
                    >
                      <option value="">Không dùng JIG</option>
                      {danhSachJig.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.ten_jig}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 5. Điều kiện làm việc & Số sản phẩm */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Điều kiện <span className="text-red-500">*</span>
                    </label>
                    <select
                      aria-label={`Điều kiện làm việc thẻ ${index + 1}`}
                      disabled={chiXem}
                      value={dong.dieu_kien_id || ''}
                      onChange={(e) =>
                        handleFieldChange(
                          index,
                          'dieu_kien_id',
                          Number(e.target.value)
                        )
                      }
                      className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#14539E] focus:outline-none disabled:bg-slate-100"
                    >
                      <option value="">-- Chọn --</option>
                      {danhSachDieuKien.map((dk) => (
                        <option key={dk.id} value={dk.id}>
                          {dk.ten_dieu_kien}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Số sản phẩm (Mặc định 1)
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      step={1}
                      aria-label={`Số sản phẩm thẻ ${index + 1}`}
                      disabled={chiXem}
                      placeholder="1"
                      value={dong.so_san_pham ?? ''}
                      onChange={(e) => {
                        const raw = e.target.value;
                        handleFieldChange(
                          index,
                          'so_san_pham',
                          raw === '' ? null : Math.max(1, parseInt(raw, 10))
                        );
                      }}
                      className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-right text-sm text-slate-900 focus:border-[#14539E] focus:outline-none disabled:bg-slate-100"
                    />
                  </div>
                </div>

                {/* 6. Số người & Sản lượng/giờ (Bàn phím số tự hiện trên điện thoại) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Số người <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0.1}
                      step={0.5}
                      aria-label={`Số người thẻ ${index + 1}`}
                      disabled={chiXem}
                      value={dong.so_nguoi ?? ''}
                      onChange={(e) =>
                        handleFieldChange(
                          index,
                          'so_nguoi',
                          e.target.value === ''
                            ? 0
                            : parseFloat(e.target.value)
                        )
                      }
                      className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-right text-sm text-slate-900 focus:border-[#14539E] focus:outline-none disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Sản lượng (pcs/giờ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={1}
                      step={1}
                      aria-label={`Sản lượng giờ thẻ ${index + 1}`}
                      disabled={chiXem}
                      value={dong.san_luong_gio ?? ''}
                      onChange={(e) =>
                        handleFieldChange(
                          index,
                          'san_luong_gio',
                          e.target.value === ''
                            ? 0
                            : parseFloat(e.target.value)
                        )
                      }
                      className={`min-h-[44px] w-full rounded-lg border px-3 py-2 text-right text-sm focus:border-[#14539E] focus:outline-none disabled:bg-slate-100 ${
                        loiSanLuong
                          ? 'border-red-400 bg-red-50 text-red-700'
                          : 'border-slate-300 bg-white text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* 7. Ghi chú */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Ghi chú
                  </label>
                  <input
                    type="text"
                    aria-label={`Ghi chú thẻ ${index + 1}`}
                    disabled={chiXem}
                    placeholder="VD: W1, W2..."
                    value={dong.ghi_chu ?? ''}
                    onChange={(e) =>
                      handleFieldChange(index, 'ghi_chu', e.target.value)
                    }
                    className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#14539E] focus:outline-none disabled:bg-slate-100"
                  />
                </div>

                {/* 8. Khối kết quả tự tính (Read-only: ST & Đơn giá VNĐ) */}
                <div className="rounded-lg border border-slate-200 bg-slate-100 p-3">
                  {loiSanLuong ? (
                    <div className="flex items-center gap-2 text-xs font-medium text-red-600">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>
                        Sản lượng/giờ phải lớn hơn 0. ST: — | Đơn giá: —
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="block text-slate-500">
                          ST tự tính (giây)
                        </span>
                        <span className="font-mono text-sm font-bold text-[#14539E]">
                          {dinhDangThapPhanCoDinhVN(ketQua.st_giay, 2)} s
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block text-slate-500">
                          Đơn giá tự tính (VNĐ/pcs)
                        </span>
                        <span className="font-mono text-sm font-bold text-[#14539E]">
                          {dinhDangThapPhanCoDinhVN(ketQua.don_gia_vnd, 2)} đ
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Nút nổi (+) thêm dòng trên điện thoại (Mục 9D) */}
      {!chiXem && onAddRow && (
        <button
          type="button"
          onClick={onAddRow}
          aria-label="Thêm dòng công đoạn mới"
          className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full bg-[#14539E] px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Thêm dòng
        </button>
      )}
    </div>
  );
};

export default TheNhapLieu;