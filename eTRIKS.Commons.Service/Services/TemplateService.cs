﻿using System.Collections.Generic;
using System.Linq;
using eTRIKS.Commons.Core.Application.Services;
using eTRIKS.Commons.Core.Domain.Interfaces;
using eTRIKS.Commons.Core.Domain.Model.Templates;
using eTRIKS.Commons.Core.Domain.Model.ControlledTerminology;

namespace eTRIKS.Commons.Service.Services{
    public class TemplateService : ITemplateService
    {

        private IServiceUoW _dataServiceUnit;

        //TODO: should be replaced with only one repository to include only the Aggregate Root (i.e. DomainTemplate)
        private readonly IRepository<DomainTemplate,string> _templateRepository;
        private readonly IRepository<DomainVariableTemplate, string> _templateVariableRepository;
        private readonly IRepository<CVterm, string> _cvTermRepository;

        public TemplateService(IServiceUoW uoW){
            _dataServiceUnit = uoW;
            _templateRepository = uoW.GetRepository<DomainTemplate, string>();
            _templateVariableRepository = uoW.GetRepository<DomainVariableTemplate,string>();
            _cvTermRepository = uoW.GetRepository<CVterm, string>();
        }

        public IEnumerable<DomainTemplate> GetAllDomains()
        {
            return _templateRepository.GetAll().ToList();
        }

        public DomainTemplate GetDomainTemplateById(string oid)
        {
            return _templateRepository.GetById(oid);
        }

        public DomainTemplate GetDomainWithVariables(string oid)
        {
            //TODO:figure out the query for that in IRepository
           return _templateRepository.GetById(oid);
        }

        public string getOIDOfCVterm(string name)
        {
            return _cvTermRepository.GetRecords(o => o.Name.Equals(name)).First().OID;
        }

        public string Gettestdomain(string something)
        {
            return something;
        }

        public void addDomainTemplate(DomainTemplate dt)
        {
            _templateRepository.Insert(dt);
            _dataServiceUnit.Save();
        }
    }
}
