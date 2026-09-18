// Mock data bám theo app Thợ Việt gốc

export type Category = {
  id: string;
  name: string; // tên 2 dòng như app gốc
  emoji: string;
  kind: 'service' | 'other' | 'pricing' | 'news';
};

export const categories: Category[] = [
  { id: 'xay-dung', name: 'Xây dựng\nSửa nhà', emoji: '🧱', kind: 'service' },
  { id: 'co-khi', name: 'Cơ khí\nNhôm kính', emoji: '⚙️', kind: 'service' },
  { id: 'dien-nuoc', name: 'Điện nước', emoji: '🔧', kind: 'service' },
  { id: 'dien-lanh', name: 'Điện lạnh', emoji: '❄️', kind: 'service' },
  { id: 'dien-may', name: 'Điện máy', emoji: '🧺', kind: 'service' },
  { id: 'do-go', name: 'Đồ gỗ\nNội thất', emoji: '🪑', kind: 'service' },
  { id: 've-sinh', name: 'Vệ sinh', emoji: '🧹', kind: 'service' },
  { id: 'thong-nghet', name: 'Thông nghẹt\nHút hầm', emoji: '🚽', kind: 'service' },
  { id: 'chuyen-nha', name: 'Chuyển nhà', emoji: '🚚', kind: 'service' },
  { id: 'khac', name: 'Dịch vụ khác', emoji: '🛠️', kind: 'other' },
  { id: 'bang-gia', name: 'Bảng giá', emoji: '📋', kind: 'pricing' },
  { id: 'tin-tuc', name: 'Tin tức', emoji: '📰', kind: 'news' },
];

export const serviceCategories = categories.filter((c) => c.kind === 'service' || c.kind === 'other');

export type Service = { id: string; categoryId: string; name: string };

const s = (categoryId: string, names: string[]): Service[] =>
  names.map((name, i) => ({ id: `${categoryId}-${i}`, categoryId, name }));

export const services: Service[] = [
  ...s('xay-dung', ['Xây dựng trọn gói', 'Cải tạo, sửa nhà trọn gói', 'Sửa tường nhà', 'Sửa trần nhà', 'Sửa sàn nhà', 'Sửa cửa nhà', 'Sơn nhà', 'Chống thấm nhà vệ sinh', 'Chống thấm sân thượng', 'Chống dột mái tôn', 'Ốp lát gạch', 'Xây tường, trát tường']),
  ...s('co-khi', ['Hàn sắt tại nhà', 'Hàn inox', 'Làm mái che, mái tôn', 'Sửa cửa sắt, cửa cuốn', 'Làm lan can, cầu thang sắt', 'Sửa cửa nhôm kính', 'Thay kính cường lực', 'Làm khung bảo vệ']),
  ...s('dien-nuoc', ['Sửa chập điện, mất điện', 'Lắp đặt đèn, quạt, ổ cắm', 'Đi dây điện âm tường', 'Sửa rò rỉ nước', 'Thay vòi nước, sen tắm', 'Sửa máy bơm nước', 'Sửa bồn cầu, lavabo', 'Lắp đặt bồn nước', 'Sửa pin năng lượng mặt trời']),
  ...s('dien-lanh', ['Vệ sinh máy lạnh', 'Sửa máy lạnh không lạnh', 'Bơm gas máy lạnh', 'Lắp đặt máy lạnh', 'Tháo lắp di dời máy lạnh', 'Sửa tủ lạnh', 'Sửa tủ đông, tủ mát', 'Điện lạnh công nghiệp']),
  ...s('dien-may', ['Vệ sinh máy giặt', 'Sửa máy giặt', 'Sửa máy nước nóng', 'Sửa bếp từ, bếp hồng ngoại', 'Sửa lò vi sóng', 'Sửa máy sấy quần áo']),
  ...s('do-go', ['Đóng tủ bếp', 'Sửa tủ, giường, bàn ghế', 'Lắp đặt sàn gỗ', 'Sửa sàn gỗ phồng rộp', 'Sửa cửa gỗ', 'Đánh vecni, sơn PU đồ gỗ']),
  ...s('ve-sinh', ['Vệ sinh bồn nước', 'Vệ sinh bể nước ngầm', 'Vệ sinh công nghiệp', 'Vệ sinh sau xây dựng', 'Giặt ghế sofa, nệm']),
  ...s('thong-nghet', ['Thông nghẹt bồn cầu', 'Thông nghẹt sàn toilet', 'Thông nghẹt lavabo, bồn rửa chén', 'Thông cống', 'Hút hầm cầu', 'Nạo vét hố ga']),
  ...s('chuyen-nha', ['Chuyển nhà trọn gói', 'Chuyển văn phòng', 'Tháo lắp nội thất', 'Cho thuê xe tải']),
  ...s('khac', ['Diệt mối, côn trùng', 'Lắp đặt camera', 'Sửa khoá, làm chìa', 'Lắp rèm cửa', 'Treo tranh, kệ, tivi']),
];

export const searchHints = 'máy lạnh, máy giặt, tủ lạnh, đèn, điện, ống nước, lavabo, bồn cầu, mái tôn, máy bơm, panel,..';

export type PriceItem = { name: string; unit: string; min: number; max?: number; note?: string };
export type PriceGroup = { id: string; title: string; items: PriceItem[] };
export type PriceList = { categoryId: string; groups: PriceGroup[] };

export const priceLists: PriceList[] = [
  {
    categoryId: 'dien-nuoc',
    groups: [
      {
        id: 'bon-cau',
        title: 'Bồn cầu',
        items: [
          { name: 'Nhân công thông nghẹt bồn cầu', unit: 'cái', min: 450000, max: 550000, note: 'Trường hợp bồn cầu bị nghẹt vật rắn: khăn vải, đồ chơi... sẽ báo giá thêm.' },
          { name: 'Nhân công sửa chữa bồn cầu bị chảy nước, không xả nước, rò rỉ nước', unit: 'cái', min: 150000, note: 'Trường hợp đục bồn cầu kỹ thuật sẽ báo giá cụ thể.' },
          { name: 'Nhân công thay phao bồn cầu', unit: 'cái', min: 150000, max: 250000, note: 'Tuỳ loại phao bồn cầu tay gạt, nút nhấn.' },
          { name: 'Tháo bồn cầu cũ, thay bồn cầu mới', unit: 'cái', min: 450000, max: 650000, note: 'Tuỳ loại kiểu bồn cầu, không bao gồm chỉnh hầm cầu.' },
        ],
      },
      {
        id: 'bon-nuoc',
        title: 'Bồn nước',
        items: [
          { name: 'Nhân công lắp đặt bồn nước 500L - 1000L', unit: 'cái', min: 350000, max: 500000, note: 'Chưa bao gồm chân đế, phụ kiện ống.' },
          { name: 'Thay phao cơ bồn nước', unit: 'cái', min: 150000, max: 200000 },
          { name: 'Vệ sinh bồn nước inox', unit: 'cái', min: 300000, max: 400000, note: 'Bồn trên 2000L báo giá riêng.' },
        ],
      },
      {
        id: 'pin-nlmt',
        title: 'Pin năng lượng mặt trời',
        items: [
          { name: 'Vệ sinh tấm pin năng lượng mặt trời', unit: 'tấm', min: 30000, max: 50000, note: 'Tối thiểu 10 tấm/lần.' },
          { name: 'Kiểm tra, sửa hệ thống điện mặt trời', unit: 'lần', min: 300000, max: 500000 },
        ],
      },
      {
        id: 'dien',
        title: 'Điện',
        items: [
          { name: 'Nhân công sửa chập điện, mất điện', unit: 'lần', min: 150000, max: 300000, note: 'Chưa bao gồm vật tư thay thế.' },
          { name: 'Lắp đèn, quạt trần, ổ cắm', unit: 'cái', min: 80000, max: 150000 },
          { name: 'Đi dây điện âm tường', unit: 'mét', min: 45000, max: 65000 },
        ],
      },
    ],
  },
  {
    categoryId: 'dien-lanh',
    groups: [
      {
        id: 'may-lanh',
        title: 'Máy lạnh',
        items: [
          { name: 'Vệ sinh máy lạnh treo tường 1HP - 2HP', unit: 'máy', min: 150000, max: 200000, note: 'Từ 2 máy giảm 20.000đ/máy.' },
          { name: 'Bơm gas máy lạnh R22 / R32 / R410A', unit: 'máy', min: 250000, max: 450000, note: 'Tuỳ loại gas và lượng gas cần nạp.' },
          { name: 'Lắp đặt máy lạnh treo tường', unit: 'máy', min: 350000, max: 500000, note: 'Bao gồm 3m ống đồng, chưa gồm dây điện.' },
          { name: 'Tháo lắp di dời máy lạnh', unit: 'máy', min: 500000, max: 700000 },
        ],
      },
      {
        id: 'tu-lanh',
        title: 'Tủ lạnh',
        items: [
          { name: 'Sửa tủ lạnh không lạnh, không đông đá', unit: 'cái', min: 200000, max: 400000, note: 'Chưa bao gồm linh kiện.' },
          { name: 'Nạp gas tủ lạnh', unit: 'cái', min: 350000, max: 500000 },
        ],
      },
    ],
  },
  {
    categoryId: 'dien-may',
    groups: [
      {
        id: 'may-giat',
        title: 'Máy giặt',
        items: [
          { name: 'Vệ sinh máy giặt cửa trên', unit: 'cái', min: 250000, max: 350000, note: 'Tháo lồng vệ sinh, tuỳ khối lượng máy.' },
          { name: 'Vệ sinh máy giặt cửa trước', unit: 'cái', min: 350000, max: 450000 },
          { name: 'Sửa máy giặt không vắt, không xả', unit: 'cái', min: 200000, max: 350000, note: 'Chưa bao gồm linh kiện.' },
        ],
      },
      {
        id: 'may-nuoc-nong',
        title: 'Máy nước nóng',
        items: [
          { name: 'Sửa máy nước nóng không nóng, rò điện', unit: 'cái', min: 150000, max: 300000 },
          { name: 'Lắp đặt máy nước nóng trực tiếp', unit: 'cái', min: 250000, max: 350000 },
        ],
      },
    ],
  },
  {
    categoryId: 'xay-dung',
    groups: [
      {
        id: 'chong-tham',
        title: 'Chống thấm',
        items: [
          { name: 'Chống thấm nhà vệ sinh', unit: 'm²', min: 250000, max: 350000, note: 'Bao gồm bóc lớp cũ, quét 2 lớp chống thấm.' },
          { name: 'Chống thấm sân thượng', unit: 'm²', min: 180000, max: 280000 },
          { name: 'Chống dột mái tôn', unit: 'điểm', min: 300000, max: 500000 },
        ],
      },
      {
        id: 'son',
        title: 'Sơn nhà',
        items: [
          { name: 'Sơn lại tường nội thất (1 lót 2 phủ)', unit: 'm²', min: 40000, max: 60000, note: 'Tuỳ hãng sơn Dulux / Jotun / Mykolor.' },
          { name: 'Xử lý tường bong tróc, bả matit', unit: 'm²', min: 35000, max: 50000 },
        ],
      },
    ],
  },
  {
    categoryId: 'thong-nghet',
    groups: [
      {
        id: 'thong-nghet',
        title: 'Thông nghẹt',
        items: [
          { name: 'Thông nghẹt sàn toilet', unit: 'lần', min: 350000, max: 450000, note: 'Dùng máy lò xo, không đục phá.' },
          { name: 'Thông nghẹt lavabo, bồn rửa chén', unit: 'lần', min: 250000, max: 350000 },
          { name: 'Hút hầm cầu', unit: 'm³', min: 500000, max: 800000, note: 'Tối thiểu 1m³.' },
        ],
      },
    ],
  },
];

export const workAreas = ['Tân Bình', 'Phú Nhuận', 'Tân Phú', 'Bình Thạnh', 'Gò Vấp', 'Quận 1', 'Quận 3', 'Quận 7', 'Quận 10', 'Bình Tân', 'Thủ Đức', 'Hóc Môn'];

export type News = { id: string; title: string; date: string; tag: string; excerpt: string; image: string; author: string; readMin: number; body: string[] };
const nimg = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;
export const news: News[] = [
  { id: 'n1', title: 'Giảm 50K khi đặt thợ qua ứng dụng Thợ Việt', date: '15/09/2026', tag: 'Khuyến mãi', excerpt: 'Áp dụng cho tất cả dịch vụ khi đặt lịch trực tiếp trên app. Cam kết hoàn tiền 100% nếu không xử lý dứt điểm.', image: nimg('photo-1621905252507-b35492cc74b4'), author: 'Thợ Việt', readMin: 2, body: ['Từ ngày 15/09/2026, tất cả khách hàng đặt lịch trực tiếp trên ứng dụng Thợ Việt sẽ được giảm ngay 50.000đ cho mọi dịch vụ: điện lạnh, điện nước, xây dựng, cơ khí, đồ gỗ, vệ sinh, chuyển nhà và thông nghẹt.', 'Ưu đãi được áp dụng tự động khi bạn hoàn tất đặt lịch trên app, không cần nhập mã. Với dịch vụ điện lạnh, mức giảm dao động 30.000đ – 50.000đ tuỳ hạng mục.', 'Đặc biệt, Thợ Việt cam kết hoàn tiền 100% nếu không xử lý dứt điểm sự cố. Mọi công việc đều được bảo hành rõ ràng và ghi nhận trong mục Lịch sử công việc để bạn dễ dàng theo dõi.', 'Chương trình áp dụng tại TP.HCM và các khu vực lân cận (Dĩ An, Thuận An). Liên hệ hotline 1800 8122 (miễn phí) nếu bạn cần hỗ trợ thêm.'] },
  { id: 'n2', title: '5 dấu hiệu máy lạnh cần vệ sinh ngay', date: '10/09/2026', tag: 'Mẹo hay', excerpt: 'Máy chảy nước, có mùi hôi, kém lạnh, tiếng ồn lớn và hoá đơn điện tăng bất thường.', image: nimg('photo-1581578731548-c64695cc6952'), author: 'KTV Nguyễn Văn Hùng', readMin: 3, body: ['Máy lạnh sau 3–6 tháng sử dụng liên tục sẽ tích tụ bụi bẩn ở dàn lạnh, lưới lọc và dàn nóng. Dưới đây là 5 dấu hiệu cho thấy máy của bạn cần được vệ sinh ngay.', '1. Máy chảy nước: máng nước và ống thoát bị nghẹt do bụi, rêu mốc khiến nước ngưng tụ tràn ra ngoài.', '2. Có mùi hôi khi bật máy: nấm mốc phát triển trong dàn lạnh, ảnh hưởng trực tiếp đến đường hô hấp, đặc biệt với trẻ nhỏ và người lớn tuổi.', '3. Kém lạnh dù đã để nhiệt độ thấp: lớp bụi dày cản trở trao đổi nhiệt, máy phải chạy lâu hơn mà vẫn không đủ mát.', '4. Tiếng ồn lớn bất thường: quạt dàn lạnh mất cân bằng do bám bụi hoặc dàn nóng bị kẹt rác.', '5. Hoá đơn tiền điện tăng đột biến: máy hoạt động quá tải để bù nhiệt, tiêu tốn thêm 15–25% điện năng.', 'Nếu gặp từ 2 dấu hiệu trở lên, hãy đặt lịch vệ sinh máy lạnh trên app Thợ Việt. Thợ sẽ vệ sinh dàn lạnh, dàn nóng, kiểm tra gas và điện áp chỉ trong 45 phút.'] },
  { id: 'n3', title: 'Chống thấm mùa mưa: nên làm gì trước?', date: '02/09/2026', tag: 'Kiến thức', excerpt: 'Kiểm tra sân thượng, khe tiếp giáp tường và hệ thống thoát nước trước khi mùa mưa đến.', image: nimg('photo-1632759145351-1d592919f522'), author: 'KTV Lê Quốc Bảo', readMin: 4, body: ['Mùa mưa ở TP.HCM kéo dài từ tháng 5 đến tháng 11. Đây là thời điểm các vấn đề thấm dột bộc lộ rõ nhất và cũng khó xử lý nhất vì bề mặt luôn ẩm ướt.', 'Kiểm tra sân thượng và mái: quan sát các vết nứt chân chim, chỗ đọng nước, khe tiếp giáp giữa tường và sàn. Đây là những điểm thấm phổ biến nhất.', 'Kiểm tra hệ thống thoát nước: dọn lá cây, rác ở phễu thu sàn, máng xối. Nước ứ đọng lâu ngày là nguyên nhân hàng đầu gây thấm ngược.', 'Xử lý sớm các vết nứt nhỏ bằng keo hoặc màng chống thấm gốc xi măng 2 thành phần khi bề mặt còn khô. Chi phí xử lý sớm thường chỉ bằng 1/3 so với khi đã thấm nặng.', 'Thợ Việt nhận khảo sát miễn phí và báo giá trọn gói chống thấm sân thượng, nhà vệ sinh, tường ngoài với bảo hành lên đến 24 tháng.'] },
  { id: 'n4', title: 'Thợ Việt mở rộng khu vực phục vụ Bình Dương', date: '25/08/2026', tag: 'Tin công ty', excerpt: 'Từ tháng 9/2026, đội thợ Thợ Việt chính thức phục vụ Dĩ An, Thuận An.', image: nimg('photo-1503387762-592deb58ef4e'), author: 'Thợ Việt', readMin: 2, body: ['Sau hơn 5 năm phục vụ khách hàng tại TP.HCM với hơn 2.000 thợ được xác minh, Thợ Việt chính thức mở rộng khu vực hoạt động sang tỉnh Bình Dương từ tháng 9/2026.', 'Giai đoạn đầu, đội thợ sẽ phục vụ đầy đủ các dịch vụ điện lạnh, điện nước, điện máy và thông nghẹt tại thành phố Dĩ An và Thuận An. Các dịch vụ xây dựng, cơ khí sẽ được triển khai từ quý IV/2026.', 'Khách hàng tại khu vực mới được hưởng đầy đủ chính sách giảm 50K khi đặt trên app, bảo hành rõ ràng và hoàn tiền 100% nếu không xử lý dứt điểm.', 'Thợ Việt xin cảm ơn sự tin tưởng của quý khách hàng và tiếp tục giữ vững 5 giá trị cốt lõi: Tín – Trí – Tốc – Tinh – Tâm.'] },
  { id: 'n5', title: 'Vệ sinh máy giặt bao lâu một lần là đủ?', date: '18/08/2026', tag: 'Mẹo hay', excerpt: 'Chuyên gia khuyến nghị 3–6 tháng/lần tuỳ tần suất sử dụng, để tránh nấm mốc và mùi hôi trên quần áo.', image: nimg('photo-1626806787461-102c1bfaaea1'), author: 'KTV Phạm Đức Anh', readMin: 3, body: ['Máy giặt là thiết bị tiếp xúc trực tiếp với quần áo của cả gia đình, nhưng lại thường bị bỏ quên trong việc vệ sinh định kỳ.', 'Với gia đình 3–4 người giặt mỗi ngày, nên vệ sinh lồng giặt 3 tháng/lần. Gia đình ít giặt hơn có thể giãn ra 6 tháng/lần.', 'Dấu hiệu cần vệ sinh sớm hơn: quần áo có mùi ẩm mốc sau khi giặt, xuất hiện cặn đen ở gioăng cao su cửa máy, máy rung lắc và kêu to hơn bình thường.', 'Vệ sinh chuyên nghiệp bao gồm tháo lồng giặt, chà rửa cặn bẩn phía sau lồng (nơi bột giặt tích tụ nhiều nhất), vệ sinh khay xà phòng và kiểm tra bơm xả. Toàn bộ quá trình mất khoảng 90 phút.'] },
  { id: 'n6', title: 'Chọn sơn nội thất: bóng, mờ hay bán bóng?', date: '05/08/2026', tag: 'Kiến thức', excerpt: 'Mỗi loại sơn phù hợp với một không gian khác nhau. Cùng Thợ Việt chọn đúng để tường bền đẹp nhiều năm.', image: nimg('photo-1562259949-e8e7689d7828'), author: 'KTV Trần Minh Tuấn', readMin: 3, body: ['Chọn độ bóng của sơn không chỉ là chuyện thẩm mỹ mà còn ảnh hưởng đến độ bền và khả năng lau chùi của bề mặt tường.', 'Sơn mờ (matt): che khuyết điểm tường tốt nhất, phù hợp phòng ngủ, phòng khách trần cao. Nhược điểm là khó lau chùi vết bẩn.', 'Sơn bán bóng (satin / semi-gloss): cân bằng giữa thẩm mỹ và độ bền, dễ lau chùi. Lựa chọn phổ biến cho phòng khách, hành lang, phòng trẻ em.', 'Sơn bóng (gloss): chống bám bẩn và ẩm tốt nhất, thích hợp bếp, nhà vệ sinh, cửa gỗ. Tuy nhiên lộ rõ mọi khuyết điểm nên đòi hỏi bề mặt phải được bả thật phẳng.', 'Thợ Việt thi công sơn 1 lót 2 phủ với Dulux, Jotun, Mykolor, bảo hành 12 tháng. Đặt lịch khảo sát miễn phí ngay trên app.'] },
];

export const memberBenefits = [
  { title: 'Giảm giá dịch vụ', desc: 'Nhận ưu đãi đặc biệt cho tất cả dịch vụ sửa chữa', icon: 'percent' },
  { title: 'Ưu tiên lịch hẹn', desc: 'Được ưu tiên sắp xếp lịch sửa chữa nhanh chóng', icon: 'clock' },
  { title: 'Hỗ trợ nhanh chóng', desc: 'Đội ngũ chăm sóc khách hàng hỗ trợ mọi lúc', icon: 'headphones' },
  { title: 'Quà tặng định kỳ', desc: 'Nhận quà tặng vào các dịp đặc biệt trong năm', icon: 'gift' },
];

export const memberTiers = [
  { name: 'Đồng', from: 0, benefit: 'Tích điểm 1%' },
  { name: 'Bạc', from: 500, benefit: 'Giảm 3% dịch vụ' },
  { name: 'Vàng', from: 2000, benefit: 'Giảm 5% + ưu tiên lịch' },
  { name: 'Kim Cương', from: 5000, benefit: 'Giảm 10% + quà tặng' },
];

export const user = { name: 'Thợ Việt', phone: '0968409323', points: 2404, tier: 'Vàng', nextTier: 'Kim Cương', nextTierAt: 5000, address: '88 Đường Số 18, Hiệp Bình, Hồ Chí Minh' };

export const timeSlots = ['08:00', '09:00', '10:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export const getCategory = (id: string) => categories.find((c) => c.id === id);
export const getPriceList = (categoryId: string) => priceLists.find((p) => p.categoryId === categoryId);

/* ---- Trang chủ: khuyến mãi, thương mại, bài viết ---- */
export type Promo = { id: string; headline: string; amount: string; sub: string; items: string[]; foot: string; colors: [string, string] };
export const promos: Promo[] = [
  { id: 'p1', headline: 'GIẢM', amount: '100K', sub: 'KHI DÙNG COMBO 2 TRONG 3 DỊCH VỤ ĐIỆN LẠNH', items: ['VỆ SINH MÁY LẠNH', 'VỆ SINH MÁY GIẶT', 'VỆ SINH TỦ LẠNH'], foot: '* Đặt lịch trên app Thợ Việt giảm ngay 30k - 50k điện lạnh và 50k cho các dịch vụ xây dựng, cơ khí, điện nước, gỗ.', colors: ['#FFF8DC', '#FFE066'] },
  { id: 'p2', headline: 'GIẢM', amount: '50K', sub: 'CHO MỌI DỊCH VỤ KHI ĐẶT LỊCH TRÊN ỨNG DỤNG', items: ['XÂY DỰNG', 'CƠ KHÍ', 'ĐIỆN NƯỚC'], foot: '* Áp dụng đơn từ 300k. Không áp dụng đồng thời với ưu đãi khác.', colors: ['#E8F1FF', '#9CC4FF'] },
  { id: 'p3', headline: 'TẶNG', amount: '2 THÁNG', sub: 'BẢO HÀNH THÊM CHO KHÁCH HÀNG THÀNH VIÊN VÀNG', items: ['CHỐNG THẤM', 'SƠN NHÀ', 'MÁI TÔN'], foot: '* Áp dụng từ 01/09/2026 đến 31/12/2026 tại TP.HCM.', colors: ['#E9F9EE', '#8FE3A8'] },
  { id: 'p4', headline: 'GIẢM', amount: '20%', sub: 'VỆ SINH MÁY LẠNH TỪ 2 MÁY TRỞ LÊN', items: ['MÁY TREO TƯỜNG', 'MÁY ÂM TRẦN', 'MÁY TỦ ĐỨNG'], foot: '* Tối đa 60k/máy. Áp dụng thứ 2 - thứ 6 hàng tuần.', colors: ['#FFF0E6', '#FFB88C'] },
  { id: 'p5', headline: 'X2', amount: 'ĐIỂM', sub: 'TÍCH ĐIỂM GẤP ĐÔI CHO MỌI ĐƠN CUỐI TUẦN', items: ['ĐIỆN NƯỚC', 'ĐIỆN LẠNH', 'VỆ SINH'], foot: '* Áp dụng thứ 7 & chủ nhật. 10.000đ = 2 điểm.', colors: ['#F3E8FF', '#C4A6FF'] },
  { id: 'p6', headline: 'MIỄN PHÍ', amount: 'KHẢO SÁT', sub: 'CHO CÔNG TRÌNH XÂY DỰNG, CHỐNG THẤM, SƠN NHÀ', items: ['KHẢO SÁT', 'BÁO GIÁ', 'TƯ VẤN'], foot: '* Trong bán kính 15km nội thành TP.HCM.', colors: ['#E0F2FE', '#7DD3FC'] },
];

export type Trade = { id: string; title: string; subtitle: string; lines: string[]; emojis: [string, string, string]; colors: [string, string]; accent: string };
export const trades: Trade[] = [
  { id: 't1', title: 'CHUYÊN CUNG CẤP', subtitle: 'THIẾT BỊ VỆ SINH', lines: ['Sản phẩm từ phổ thông đến cao cấp', 'Lắp đặt - Bảo hành - Sửa chữa tận nơi', 'Có đầy đủ linh kiện thay thế, sửa chữa về sau'], emojis: ['🚰', '🚽', '🚿'], colors: ['#BDE7FA', '#5EC2EF'], accent: '#1D4ED8' },
  { id: 't2', title: 'PHÂN PHỐI & LẮP ĐẶT', subtitle: 'MÁY LẠNH CHÍNH HÃNG', lines: ['Daikin - Panasonic - LG - Toshiba', 'Giá tốt hơn siêu thị điện máy', 'Bảo hành 12 tháng nhân công'], emojis: ['🌬️', '❄️', '🎛️'], colors: ['#DCEBFF', '#7FB2FF'], accent: '#1E3A8A' },
  { id: 't3', title: 'THI CÔNG', subtitle: 'PIN NĂNG LƯỢNG MẶT TRỜI', lines: ['Khảo sát & thiết kế miễn phí', 'Tiết kiệm đến 70% tiền điện', 'Bảo trì định kỳ trọn đời'], emojis: ['🔋', '☀️', '⚡'], colors: ['#FFF1C2', '#FFC94D'], accent: '#92400E' },
  { id: 't4', title: 'CUNG CẤP', subtitle: 'SƠN & VẬT TƯ XÂY DỰNG', lines: ['Dulux - Jotun - Mykolor', 'Giao tận công trình', 'Tư vấn phối màu miễn phí'], emojis: ['🖌️', '🎨', '🪣'], colors: ['#FCE7F3', '#F9A8D4'], accent: '#9D174D' },
  { id: 't5', title: 'PHÂN PHỐI', subtitle: 'MÁY NƯỚC NÓNG & MÁY BƠM', lines: ['Ariston - Panasonic - Pentax', 'Lắp đặt trong ngày', 'Bảo hành chính hãng 24 tháng'], emojis: ['🚰', '♨️', '🔩'], colors: ['#FEE2E2', '#FCA5A5'], accent: '#991B1B' },
  { id: 't6', title: 'THI CÔNG', subtitle: 'NỘI THẤT GỖ CÔNG NGHIỆP', lines: ['Tủ bếp - Tủ áo - Kệ tivi', 'Đo đạc thiết kế 3D miễn phí', 'Gỗ An Cường chống ẩm'], emojis: ['🪑', '🚪', '🛏️'], colors: ['#FEF3C7', '#FCD34D'], accent: '#78350F' },
];

/* Khu vực làm việc chi tiết */
export type District = { name: string; workers: number; eta: string };
export const districts: District[] = [
  { name: 'Quận 1', workers: 86, eta: '30 phút' }, { name: 'Quận 3', workers: 72, eta: '30 phút' }, { name: 'Quận 5', workers: 58, eta: '35 phút' },
  { name: 'Quận 7', workers: 94, eta: '30 phút' }, { name: 'Quận 10', workers: 66, eta: '35 phút' }, { name: 'Quận 12', workers: 48, eta: '45 phút' },
  { name: 'Tân Bình', workers: 120, eta: '25 phút' }, { name: 'Tân Phú', workers: 135, eta: '20 phút' }, { name: 'Phú Nhuận', workers: 78, eta: '25 phút' },
  { name: 'Bình Thạnh', workers: 110, eta: '30 phút' }, { name: 'Gò Vấp', workers: 98, eta: '30 phút' }, { name: 'Bình Tân', workers: 88, eta: '40 phút' },
  { name: 'Thủ Đức', workers: 102, eta: '40 phút' }, { name: 'Hóc Môn', workers: 36, eta: '50 phút' }, { name: 'Nhà Bè', workers: 28, eta: '55 phút' },
];
