import React, { useEffect } from 'react';
import { Icon } from '../components/Icon';
import logoIcon from '../assets/logo-icon.png';

export type LegalDoc = 'terms' | 'privacy';

interface LegalPageProps {
    doc: LegalDoc;
    onClose: () => void;
    onSwitch: (doc: LegalDoc) => void;
}

interface Section {
    h: string;
    body: (string | string[])[]; // string = đoạn văn, string[] = danh sách gạch đầu dòng
}

const UPDATED = '28/07/2026';
const OWNER = 'Hộ kinh doanh Ground Truth';
const APP_NAME = 'Ground Truth - Hồ Sơ Thợ';

const TERMS: Section[] = [
    {
        h: '1. Giới thiệu & chấp nhận điều khoản',
        body: [
            `Ứng dụng “${APP_NAME}” (dưới đây gọi là “Ứng dụng”) là một tiện ích phần mềm do ${OWNER} phát hành và vận hành cùng nền tảng doitay.vn. Ứng dụng giúp thợ (điện, nước, điều hoà, xây dựng, sơn, mộc…) tự tạo một thẻ hồ sơ nghề điện tử để giới thiệu tay nghề với khách hàng.`,
            'Khi mở và sử dụng Ứng dụng, bạn xác nhận đã đọc, hiểu và đồng ý với Điều khoản sử dụng này cùng Chính sách bảo mật đi kèm. Nếu không đồng ý, vui lòng ngừng sử dụng Ứng dụng.',
        ],
    },
    {
        h: '2. Bản chất dịch vụ',
        body: [
            'Ứng dụng là công cụ tạo hồ sơ/danh thiếp nghề. Ground Truth là đơn vị cung cấp NỀN TẢNG PHẦN MỀM, không trực tiếp cung cấp dịch vụ sửa chữa và không phải là bên trung gian giao dịch giữa thợ và khách hàng.',
            'Ứng dụng miễn phí hoàn toàn với thợ. Chúng tôi không thu phí, không bán “lead” (thông tin khách) và không thu hoa hồng trên giao dịch của thợ.',
            'Ứng dụng không có chức năng đăng nhập hay tài khoản riêng: mở là dùng ngay; tên và ảnh đại diện (nếu bạn cho phép) do Zalo cung cấp.',
        ],
    },
    {
        h: '3. Trách nhiệm của người dùng',
        body: [
            'Khi tạo hồ sơ, bạn cam kết:',
            [
                'Cung cấp thông tin trung thực, chính xác về bản thân và tay nghề của mình;',
                'Chỉ đăng ảnh công việc do chính bạn thực hiện, không dùng ảnh của người khác, ảnh sai sự thật hay ảnh vi phạm bản quyền;',
                'Không mạo danh người khác, không đăng nội dung trái pháp luật, lừa đảo, xúc phạm hoặc vi phạm thuần phong mỹ tục;',
                'Tự chịu trách nhiệm về nội dung, hình ảnh, bảng giá và cam kết dịch vụ mà bạn công bố với khách.',
            ],
        ],
    },
    {
        h: '4. Nội dung do người dùng tạo',
        body: [
            'Bạn giữ toàn quyền với nội dung mình đăng (thông tin, ảnh việc). Khi bạn chủ động chọn đưa hồ sơ lên chợ thợ doitay.vn, bạn cho phép chúng tôi lưu trữ và hiển thị nội dung đó nhằm mục đích giúp khách hàng tìm thấy và liên hệ với bạn.',
            'Chúng tôi có quyền gỡ bỏ nội dung hoặc tạm khóa hồ sơ nếu phát hiện vi phạm Điều khoản này hoặc quy định pháp luật.',
        ],
    },
    {
        h: '5. Giới hạn trách nhiệm',
        body: [
            'Ứng dụng cung cấp công cụ tạo hồ sơ, không bảo đảm bạn sẽ có khách hay có việc. Mọi giao dịch, thoả thuận giá cả, chất lượng và tranh chấp (nếu có) giữa thợ và khách hàng là quan hệ trực tiếp giữa hai bên; Ground Truth không chịu trách nhiệm cho các giao dịch này.',
            'Chúng tôi nỗ lực duy trì Ứng dụng hoạt động ổn định nhưng không cam kết dịch vụ luôn liên tục, không lỗi hoặc không gián đoạn.',
        ],
    },
    {
        h: '6. Thay đổi & liên hệ',
        body: [
            'Chúng tôi có thể cập nhật Điều khoản sử dụng theo thời gian. Bản mới nhất luôn hiển thị trong Ứng dụng. Việc bạn tiếp tục sử dụng sau khi cập nhật được xem là chấp nhận điều khoản mới.',
            'Điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Mọi thắc mắc, vui lòng liên hệ qua thông tin ở cuối trang.',
        ],
    },
];

const PRIVACY: Section[] = [
    {
        h: '1. Chúng tôi là ai',
        body: [
            `Chính sách này mô tả cách ${OWNER} (đơn vị vận hành Ứng dụng “${APP_NAME}” và nền tảng doitay.vn) thu thập, sử dụng và bảo vệ thông tin của bạn.`,
        ],
    },
    {
        h: '2. Thông tin chúng tôi thu thập',
        body: [
            'Từ tài khoản Zalo (chỉ khi bạn đồng ý cấp quyền):',
            [
                'Tên hiển thị và ảnh đại diện Zalo — dùng để điền sẵn vào hồ sơ, giúp bạn đỡ phải nhập tay.',
            ],
            'Thông tin bạn tự nhập để tạo hồ sơ nghề:',
            [
                'Họ tên, số điện thoại;',
                'Nghề, khu vực nhận việc, số năm kinh nghiệm;',
                'Giới thiệu bản thân, kỹ năng, bảng giá dịch vụ;',
                'Ảnh công việc bạn đã làm.',
            ],
        ],
    },
    {
        h: '3. Mục đích sử dụng',
        body: [
            'Thông tin của bạn chỉ được dùng để:',
            [
                'Tạo thẻ hồ sơ nghề và mã QR để bạn gửi cho khách qua Zalo;',
                'Hiển thị hồ sơ cho khách hàng khi bạn chủ động chia sẻ;',
                'Tuỳ chọn: đưa hồ sơ lên chợ thợ doitay.vn để khách trên mạng tìm thấy bạn.',
            ],
        ],
    },
    {
        h: '4. Lưu trữ & chia sẻ dữ liệu',
        body: [
            'Mặc định, hồ sơ của bạn được lưu ngay trên thiết bị của bạn. Ứng dụng CHỈ gửi thông tin lên máy chủ doitay.vn KHI bạn chủ động bật tuỳ chọn “đồng bộ với doitay.vn” hoặc bấm chia sẻ hồ sơ — khi đó hồ sơ được tạo ở trạng thái chờ duyệt để hiển thị cho khách.',
            'Chúng tôi KHÔNG bán, KHÔNG cho thuê và KHÔNG trao đổi thông tin cá nhân của bạn cho bên thứ ba vì mục đích quảng cáo. Thông tin bạn công bố trên hồ sơ (tên, nghề, khu vực, số điện thoại, ảnh việc) sẽ hiển thị công khai cho khách xem — đây là mục đích chính của việc tạo hồ sơ.',
            'Dữ liệu truyền đi được bảo vệ qua kết nối mã hoá HTTPS.',
        ],
    },
    {
        h: '5. Quyền của bạn',
        body: [
            'Bạn có quyền:',
            [
                'Xem, chỉnh sửa hoặc xoá thông tin trong hồ sơ bất cứ lúc nào;',
                'Đăng xuất để xoá dữ liệu lưu trên thiết bị;',
                'Yêu cầu gỡ hồ sơ đã công khai trên doitay.vn bằng cách liên hệ với chúng tôi.',
            ],
            'Bạn có thể từ chối cấp quyền tên/ảnh Zalo; khi đó bạn vẫn dùng Ứng dụng bình thường bằng cách tự nhập thông tin.',
        ],
    },
    {
        h: '6. Bảo mật & thay đổi chính sách',
        body: [
            'Chúng tôi áp dụng các biện pháp hợp lý để bảo vệ thông tin của bạn và chỉ thu thập dữ liệu cần thiết cho mục đích tạo hồ sơ nghề. Chúng tôi có thể cập nhật Chính sách bảo mật; bản mới nhất luôn hiển thị trong Ứng dụng.',
        ],
    },
];

const Header: React.FC<{ title: string; onClose: () => void }> = ({ title, onClose }) => (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-border-light bg-white/95 px-3 backdrop-blur">
        <button
            type="button"
            onClick={onClose}
            aria-label="Quay lại"
            className="flex size-11 items-center justify-center rounded-full text-navy active:scale-95 transition-transform"
        >
            <Icon name="arrow_back" size={24} />
        </button>
        <span className="font-extrabold text-[18px] tracking-tight text-navy">{title}</span>
    </header>
);

const Tab: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[14px] font-bold transition-colors ${
            active ? 'bg-primary text-white shadow-card' : 'bg-white text-ink/60'
        }`}
    >
        <Icon name={icon} size={18} color={active ? '#FFFFFF' : '#8A99A8'} />
        {label}
    </button>
);

const renderBody = (body: (string | string[])[]) =>
    body.map((item, i) =>
        Array.isArray(item) ? (
            <ul key={i} className="mb-3 space-y-1.5 pl-1">
                {item.map((li, j) => (
                    <li key={j} className="flex gap-2.5 text-[15px] leading-relaxed text-ink/80">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"></span>
                        <span>{li}</span>
                    </li>
                ))}
            </ul>
        ) : (
            <p key={i} className="mb-3 text-[15px] leading-relaxed text-ink/80">
                {item}
            </p>
        )
    );

export const LegalPage: React.FC<LegalPageProps> = ({ doc, onClose, onSwitch }) => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [doc]);

    const isTerms = doc === 'terms';
    const sections = isTerms ? TERMS : PRIVACY;
    const title = isTerms ? 'Điều khoản sử dụng' : 'Chính sách bảo mật';

    return (
        <div className="fixed inset-0 z-[60] flex flex-col bg-paper font-display text-ink">
            <Header title="Điều khoản & Bảo mật" onClose={onClose} />

            {/* Tab chuyển giữa 2 văn bản */}
            <div className="flex gap-2 border-b border-border-light bg-paper px-4 py-3">
                <Tab active={isTerms} onClick={() => onSwitch('terms')} icon="check_circle" label="Điều khoản" />
                <Tab active={!isTerms} onClick={() => onSwitch('privacy')} icon="lock" label="Bảo mật" />
            </div>

            {/* Nội dung */}
            <div className="flex-1 overflow-y-auto px-5 pb-10 pt-5 max-w-[560px] mx-auto w-full">
                <div className="mb-5 flex items-center gap-3">
                    <img src={logoIcon} alt="" className="h-10 w-10 object-contain" />
                    <div className="leading-tight">
                        <h1 className="text-[20px] font-extrabold text-navy">{title}</h1>
                        <p className="text-[13px] text-ink/50">Cập nhật lần cuối: {UPDATED}</p>
                    </div>
                </div>

                {sections.map((s, i) => (
                    <section key={i} className="mb-5">
                        <h2 className="mb-2 text-[16px] font-extrabold text-navy">{s.h}</h2>
                        {renderBody(s.body)}
                    </section>
                ))}

                {/* Liên hệ */}
                <div className="mt-6 rounded-2xl bg-white p-4 shadow-card">
                    <h2 className="mb-2 text-[15px] font-extrabold text-navy">Liên hệ</h2>
                    <p className="text-[14px] leading-relaxed text-ink/70">
                        {OWNER} — vận hành nền tảng doitay.vn
                        <br />
                        Website:{' '}
                        <a className="font-semibold text-primary underline" href="https://doitay.vn" target="_blank" rel="noreferrer">
                            doitay.vn
                        </a>
                        <br />
                        Hotline / Zalo: 0972 585 990
                    </p>
                    <p className="mt-3 text-[13px] text-ink/45">
                        Bản đầy đủ cũng được đăng tại{' '}
                        <a
                            className="text-primary underline"
                            href={isTerms ? 'https://doitay.vn/dieu-khoan' : 'https://doitay.vn/bao-mat'}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {isTerms ? 'doitay.vn/dieu-khoan' : 'doitay.vn/bao-mat'}
                        </a>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LegalPage;
