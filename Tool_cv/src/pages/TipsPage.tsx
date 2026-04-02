import React, { useState } from 'react';
import { Icon } from '../components/Icon';
import tip1Image from '../assets/tip1.png';
import tip2Image from '../assets/tip2.png';
import tip3Image from '../assets/tip3.png';

interface TipsPageProps {
    onBack?: () => void;
}

interface TipArticle {
    id: number;
    title: string;
    shortDesc: string;
    fullContent: string[];
    badge?: string;
    badgeColor?: string;
    icon: string;
    image?: string;
    readTime: string;
}

export const TipsPage: React.FC<TipsPageProps> = ({ onBack }) => {
    const [selectedTip, setSelectedTip] = useState<TipArticle | null>(null);

    const tips: TipArticle[] = [
        {
            id: 1,
            title: 'Thêm ảnh dự án thực tế',
            shortDesc: 'Cập nhật hình ảnh các công trình bạn vừa hoàn thành để thu hút khách hàng mới.',
            badge: '+15 điểm tin cậy',
            badgeColor: 'bg-green-100 text-green-700',
            icon: 'photo_library',
            image: tip1Image,
            readTime: '3 phút đọc',
            fullContent: [
                'Hình ảnh là yếu tố quan trọng nhất để khách hàng đánh giá tay nghề của bạn trước khi liên hệ. Một bộ ảnh chất lượng có thể tăng tỷ lệ được liên hệ lên đến 80%.',
                '## Tại sao ảnh dự án quan trọng?',
                '**1. Tạo niềm tin ngay từ cái nhìn đầu tiên**\nKhách hàng thường scroll qua nhiều hồ sơ thợ. Những ai có ảnh dự án thực tế sẽ nổi bật hơn và tạo được ấn tượng chuyên nghiệp.',
                '**2. Chứng minh tay nghề không lời nào**\nÁnh dẫn chứng hùng hồn nhất cho kỹ năng của bạn. Một bức ảnh ống nước được lắp gọn gàng nói lên nhiều điều hơn 100 chữ.',
                '**3. Ảnh trước/sau tạo hiệu ứng WOW**\nKhách hàng sẽ rất ấn tượng khi thấy sự khác biệt giữa trước và sau khi bạn hoàn thành công việc.',
                '## Mẹo chụp ảnh ấn tượng',
                '• **Chụp khi có đủ ánh sáng** - Tránh chụp trong điều kiện thiếu sáng hoặc ngược sáng',
                '• **Dọn dẹp hiện trường** - Khu vực xung quanh sạch sẽ làm công trình nổi bật hơn',
                '• **Chụp nhiều góc** - Góc toàn cảnh + Góc chi tiết để khách thấy được tổng thể và sự tỉ mỉ',
                '• **Luôn chụp ảnh TRƯỚC khi làm** - Đừng quên, đây là điều nhiều thợ hay bỏ qua!',
                '## Số lượng ảnh nên có',
                'Tối thiểu 3 dự án, mỗi dự án có ít nhất 1 ảnh trước và 1 ảnh sau. Lý tưởng là 5-10 dự án để khách hàng thấy được sự đa dạng trong công việc của bạn.',
            ],
        },
        {
            id: 2,
            title: 'Thu thập đánh giá từ khách hàng',
            shortDesc: 'Lời khen từ khách hàng cũ là cách tốt nhất để xây dựng lòng tin với khách mới.',
            badge: 'Rất quan trọng',
            badgeColor: 'bg-yellow-100 text-yellow-700',
            icon: 'reviews',
            image: tip2Image,
            readTime: '4 phút đọc',
            fullContent: [
                'Đánh giá 5 sao từ khách hàng thực sự là "vàng" trong ngành dịch vụ. 92% người dùng đọc đánh giá trước khi quyết định chọn thợ. Đây là cách thu thập đánh giá hiệu quả nhất.',
                '## Tại sao đánh giá quan trọng?',
                '**1. Bằng chứng xã hội (Social Proof)**\nKhi nhiều người khen ngợi bạn, khách hàng mới sẽ tin tưởng hơn. Đây là hiệu ứng tâm lý mạnh mẽ trong kinh doanh.',
                '**2. Tăng vị trí hiển thị**\nTrên ThợTốt, hồ sơ có nhiều đánh giá tốt sẽ được ưu tiên hiển thị cho khách hàng đang tìm kiếm.',
                '**3. Khách hàng sẵn sàng trả cao hơn**\nThợ có nhiều đánh giá 5 sao có thể báo giá cao hơn 10-20% mà khách vẫn chấp nhận.',
                '## Cách xin đánh giá không ngại ngùng',
                '**Thời điểm vàng:** Ngay sau khi hoàn thành và khách hàng tỏ ra hài lòng',
                '**Cách nói:** "Anh/chị ơi, nếu hài lòng với công việc, bên em mong anh/chị dành 1 phút để lại đánh giá giúp em nhé. Đánh giá từ khách hàng giúp em có thêm khách mới, em rất cảm ơn ạ!"',
                '**Tip:** Gửi tin nhắn cảm ơn kèm link đánh giá sau khi xong việc 1-2 tiếng, lúc này khách vẫn đang ấn tượng tốt.',
                '## Xử lý đánh giá không tốt',
                '• Luôn phản hồi một cách chuyên nghiệp và tìm cách khắc phục',
                '• Đừng tranh cãi - hãy thể hiện sự thiện chí muốn cải thiện',
                '• Một phản hồi tốt có thể biến đánh giá xấu thành cơ hội thể hiện độ chuyên nghiệp',
            ],
        },
        {
            id: 3,
            title: 'Hoàn thiện hồ sơ xác thực',
            shortDesc: 'Xác thực danh tính để nhận huy hiệu "Đã xác thực" và tăng độ tin cậy lên 200%.',
            badge: 'Huy hiệu đặc biệt',
            badgeColor: 'bg-blue-100 text-blue-700',
            icon: 'verified_user',
            image: tip3Image,
            readTime: '2 phút đọc',
            fullContent: [
                'Huy hiệu "Đã xác thực" là dấu hiệu nhận biết thợ uy tín trên ThợTốt. Khách hàng sẽ ưu tiên chọn thợ có huy hiệu này vì họ biết thông tin đã được kiểm chứng.',
                '## Lợi ích của việc xác thực',
                '**1. Tăng 200% lượt liên hệ**\nKhách hàng tin tưởng và liên hệ nhiều hơn với thợ đã xác thực.',
                '**2. Được ưu tiên hiển thị**\nHồ sơ có huy hiệu xác thực luôn xuất hiện đầu tiên trong kết quả tìm kiếm.',
                '**3. Tăng giá dịch vụ**\nKhách sẵn sàng trả thêm 15-25% cho thợ đã được xác thực danh tính.',
                '## Các bước xác thực',
                '**Bước 1:** Chuẩn bị giấy tờ tùy thân (CMND/CCCD)',
                '**Bước 2:** Chụp ảnh mặt trước và mặt sau giấy tờ rõ ràng',
                '**Bước 3:** Chụp ảnh selfie cầm giấy tờ',
                '**Bước 4:** Gửi lên hệ thống và đợi duyệt (1-2 ngày làm việc)',
                '## Mẹo để được duyệt nhanh',
                '• Chụp ảnh giấy tờ dưới ánh sáng tốt, không bị mờ hoặc che khuất',
                '• Ảnh selfie: nhìn thẳng vào camera, giữ CCCD ngang mặt',
                '• Đảm bảo thông tin trên giấy tờ khớp với hồ sơ đăng ký',
                '• Nếu bị từ chối, đọc kỹ lý do và chụp lại đúng yêu cầu',
            ],
        },
    ];

    // Article detail view
    if (selectedTip) {
        return (
            <div className="min-h-screen bg-white">
                {/* Header */}
                <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
                    <div className="flex items-center p-4 gap-3">
                        <button
                            onClick={() => setSelectedTip(null)}
                            className="flex items-center justify-center size-10 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <Icon name="arrow_back" size={24} />
                        </button>
                        <h1 className="text-lg font-bold text-slate-900 flex-1 truncate">{selectedTip.title}</h1>
                    </div>
                </div>

                {/* Hero Image */}
                {selectedTip.image && (
                    <div
                        className="w-full h-48 bg-cover bg-center"
                        style={{ backgroundImage: `url("${selectedTip.image}")` }}
                    />
                )}

                {/* Article Content */}
                <div className="p-5">
                    {/* Meta info */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${selectedTip.badgeColor || 'bg-blue-100 text-blue-700'}`}>
                            {selectedTip.badge}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Icon name="schedule" size={14} color="#94a3b8" />
                            {selectedTip.readTime}
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-slate-900 mb-4 leading-tight">{selectedTip.title}</h1>

                    {/* Content */}
                    <div className="prose prose-sm max-w-none">
                        {selectedTip.fullContent.map((paragraph, idx) => {
                            // Handle headers
                            if (paragraph.startsWith('## ')) {
                                return (
                                    <h2 key={idx} className="text-lg font-bold text-slate-900 mt-6 mb-3">
                                        {paragraph.replace('## ', '')}
                                    </h2>
                                );
                            }
                            // Handle bold paragraphs
                            if (paragraph.startsWith('**')) {
                                const parts = paragraph.split('\n');
                                return (
                                    <div key={idx} className="mb-3">
                                        {parts.map((part, pIdx) => {
                                            const boldMatch = part.match(/^\*\*(.+?)\*\*(.*)$/);
                                            if (boldMatch) {
                                                return (
                                                    <p key={pIdx} className="text-slate-700 leading-relaxed">
                                                        <strong className="text-slate-900">{boldMatch[1]}</strong>
                                                        {boldMatch[2]}
                                                    </p>
                                                );
                                            }
                                            return <p key={pIdx} className="text-slate-600">{part}</p>;
                                        })}
                                    </div>
                                );
                            }
                            // Handle bullet points
                            if (paragraph.startsWith('• ')) {
                                return (
                                    <div key={idx} className="flex gap-2 mb-2 pl-2">
                                        <span className="text-primary font-bold">•</span>
                                        <p className="text-slate-700 leading-relaxed flex-1">
                                            {paragraph.replace('• ', '').split('**').map((part, i) =>
                                                i % 2 === 1 ? <strong key={i} className="text-slate-900">{part}</strong> : part
                                            )}
                                        </p>
                                    </div>
                                );
                            }
                            // Regular paragraph
                            return (
                                <p key={idx} className="text-slate-700 leading-relaxed mb-4">
                                    {paragraph}
                                </p>
                            );
                        })}
                    </div>

                    {/* CTA */}
                    <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="size-10 rounded-full bg-primary flex items-center justify-center">
                                <Icon name={selectedTip.icon} size={20} color="white" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">Áp dụng ngay!</p>
                                <p className="text-xs text-slate-500">Cập nhật hồ sơ của bạn</p>
                            </div>
                        </div>
                        <button
                            onClick={() => { setSelectedTip(null); onBack?.(); }}
                            className="w-full h-12 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Icon name="edit" size={20} color="white" />
                            Cập nhật hồ sơ
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Tips list view
    return (
        <div className="min-h-screen bg-[#f8f9fc]">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
                <div className="flex items-center p-4 gap-3">
                    <button
                        onClick={onBack}
                        className="flex items-center justify-center size-10 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <Icon name="arrow_back" size={24} />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Mẹo tăng uy tín</h1>
                </div>
            </div>

            {/* Intro Section */}
            <div className="bg-gradient-to-br from-primary to-blue-600 px-5 py-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                    <div className="size-12 rounded-full bg-white/20 flex items-center justify-center">
                        <Icon name="trending_up" size={28} color="white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Xây dựng uy tín</h2>
                        <p className="text-blue-100 text-sm">3 bước đơn giản, hiệu quả ngay</p>
                    </div>
                </div>
                <p className="text-blue-50 text-sm leading-relaxed">
                    Uy tín là yếu tố quan trọng nhất để khách hàng chọn bạn. Những mẹo dưới đây đã được chứng minh giúp tăng 80% lượt liên hệ.
                </p>
            </div>

            {/* Tips List */}
            <div className="p-4 space-y-4">
                {tips.map((tip, index) => (
                    <button
                        key={tip.id}
                        onClick={() => setSelectedTip(tip)}
                        className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 text-left hover:shadow-md transition-all active:scale-[0.99]"
                    >
                        <div className="flex">
                            {/* Number */}
                            <div className="w-16 bg-gradient-to-b from-primary to-blue-600 flex items-center justify-center shrink-0">
                                <span className="text-3xl font-bold text-white">{index + 1}</span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-4">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="font-bold text-slate-900">{tip.title}</h3>
                                    <Icon name="chevron_right" size={20} color="#94a3b8" />
                                </div>
                                <p className="text-sm text-slate-500 line-clamp-2 mb-3">{tip.shortDesc}</p>
                                <div className="flex items-center gap-2">
                                    {tip.badge && (
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${tip.badgeColor}`}>
                                            {tip.badge}
                                        </span>
                                    )}
                                    <span className="text-xs text-slate-400">{tip.readTime}</span>
                                </div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Summary Card */}
            <div className="p-4 pb-8">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-center gap-3 mb-2">
                        <Icon name="lightbulb" size={24} color="#16a34a" />
                        <span className="font-bold text-green-800">Mẹo nhỏ</span>
                    </div>
                    <p className="text-sm text-green-700 leading-relaxed">
                        Thực hiện đủ 3 bước trên có thể tăng điểm uy tín của bạn lên <strong>+50 điểm</strong> và tăng tỷ lệ được khách hàng liên hệ lên <strong>80%</strong>!
                    </p>
                </div>
            </div>
        </div>
    );
};
