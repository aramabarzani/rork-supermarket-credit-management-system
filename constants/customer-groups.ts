export const CUSTOMER_GROUPS = [
  {
    id: 'family',
    name: 'خانەوادە',
    description: 'کڕیارانی خانەوادەیی',
    color: '#10B981',
  },
  {
    id: 'company',
    name: 'کۆمپانیا',
    description: 'کڕیارانی کۆمپانیا و کاروبار',
    color: '#3B82F6',
  },
  {
    id: 'wholesale',
    name: 'کۆگا',
    description: 'کڕیارانی کۆگا و فرۆشتنی گەورە',
    color: '#8B5CF6',
  },
  {
    id: 'retail',
    name: 'وردە',
    description: 'کڕیارانی وردە و تاک',
    color: '#F59E0B',
  },
  {
    id: 'vip',
    name: 'تایبەت',
    description: 'کڕیارانی تایبەت و گرنگ',
    color: '#EF4444',
  },
  {
    id: 'regular',
    name: 'ئاسایی',
    description: 'کڕیارانی ئاسایی',
    color: '#6B7280',
  },
] as const;

export type CustomerGroupId = typeof CUSTOMER_GROUPS[number]['id'];

export const getCustomerGroupById = (id: string) => {
  return CUSTOMER_GROUPS.find(group => group.id === id);
};

export const getCustomerGroupColor = (id: string) => {
  const group = getCustomerGroupById(id);
  return group?.color || '#6B7280';
};

export const getCustomerGroupName = (id: string) => {
  const group = getCustomerGroupById(id);
  return group?.name || 'ئاسایی';
};