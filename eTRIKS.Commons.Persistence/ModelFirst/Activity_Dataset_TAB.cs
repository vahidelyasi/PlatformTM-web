//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace eTRIKS.Commons.Persistence.ModelFirst
{
    using System;
    using System.Collections.Generic;
    
    public partial class Activity_Dataset_TAB
    {
        public Activity_Dataset_TAB()
        {
            this.Variable_Ref_TAB = new HashSet<Variable_Ref_TAB>();
        }
    
        public string domainId { get; set; }
        public string dataFile { get; set; }
        public string activityId { get; set; }
        public string OID { get; set; }
    
        public virtual Activity_TAB Activity_TAB { get; set; }
        public virtual ICollection<Variable_Ref_TAB> Variable_Ref_TAB { get; set; }
    }
}