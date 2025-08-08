import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import AddLeadForm from './AddLeadForm';
import type { Lead, CreateLeadRequest, LeadStatus } from '@/types/leads';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const LeadsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');

  // Fetch leads based on user role
  useEffect(() => {
    fetchLeads();
  }, [user]);

  const fetchLeads = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const leadsRef = collection(db, 'leads');
      let q;

      if (user.role === 'sales') {
        // Sales staff can only see their own leads
        q = query(
          leadsRef,
          where('salesStaffId', '==', user.userId || user.id),
          orderBy('createdAt', 'desc')
        );
      } else if (user.role === 'admin') {
        // Admin can see all leads
        q = query(leadsRef, orderBy('createdAt', 'desc'));
      } else {
        // Other roles get empty results
        setLeads([]);
        return;
      }

      const snapshot = await getDocs(q);
      const leadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        lastVisitDate: doc.data().lastVisitDate?.toDate(),
        nextFollowUpDate: doc.data().nextFollowUpDate?.toDate(),
        conversionDate: doc.data().conversionDate?.toDate(),
      })) as Lead[];

      setLeads(leadsData);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = async (leadData: CreateLeadRequest) => {
    if (!user) return;

    try {
      const newLead = {
        ...leadData,
        status: 'new' as LeadStatus,
        salesStaffId: user.userId || user.id,
        salesStaffName: user.displayName,
        territoryId: user.territoryId,
        totalVisits: 0,
        createdAt: serverTimestamp(),
        createdBy: user.userId || user.id,
        updatedAt: serverTimestamp(),
        updatedBy: user.userId || user.id,
      };


      await addDoc(collection(db, 'leads'), newLead);
      setShowAddForm(false);
      fetchLeads(); // Refresh the list
    } catch (error) {
      console.error('Error adding lead:', error);
      throw error;
    }
  };

  const getStatusColor = (status: LeadStatus) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800',
      'contacted': 'bg-yellow-100 text-yellow-800',
      'visited': 'bg-purple-100 text-purple-800',
      'qualified': 'bg-green-100 text-green-800',
      'converted': 'bg-emerald-100 text-emerald-800',
      'rejected': 'bg-red-100 text-red-800',
      'inactive': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-600',
      'medium': 'bg-orange-100 text-orange-600',
      'high': 'bg-red-100 text-red-600'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchTerm === '' || 
      lead.opticianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contactPersonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phoneNumber.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (!user) {
    return <div className="text-center py-8">Loading user...</div>;
  }

  if (showAddForm) {
    return (
      <AddLeadForm 
        onSubmit={handleAddLead}
        onCancel={() => setShowAddForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lead Management</h1>
          <p className="text-muted-foreground">
            Manage and track your optician leads
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          Add New Lead
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.filter(l => l.status === 'new').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Qualified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.filter(l => l.status === 'qualified').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.filter(l => l.status === 'converted').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search leads by name, contact, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="visited">Visited</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="text-center py-8">
          <p>Loading leads...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' ? 'No leads match your filters.' : 'No leads found. Add your first lead to get started.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredLeads.map((lead) => (
            <Card key={lead.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-lg">{lead.opticianName}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(lead.status)}`}>
                        {lead.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(lead.priority)}`}>
                        {lead.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{lead.contactPersonName} • {lead.phoneNumber}</p>
                    <p className="text-sm text-muted-foreground">{lead.address}</p>
                    {lead.notes && (
                      <p className="text-sm text-muted-foreground italic">{lead.notes}</p>
                    )}
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {lead.totalVisits} visits
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Added {lead.createdAt.toLocaleDateString()}
                    </p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Schedule Visit
                      </Button>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeadsDashboard;