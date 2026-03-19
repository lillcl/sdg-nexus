"""
MUN Committees catalogue — organised by UN system body.
"""

COMMITTEES = [
    {"id":"GA1","name":"General Assembly First Committee","abbr":"GA1","type":"General Assembly","sdg_links":[16,17],"desc":"Disarmament and international security issues.","typical_size":[80,193]},
    {"id":"GA2","name":"General Assembly Second Committee","abbr":"GA2","type":"General Assembly","sdg_links":[1,2,8,9,10,17],"desc":"Economic and financial affairs, sustainable development.","typical_size":[60,193]},
    {"id":"GA3","name":"General Assembly Third Committee","abbr":"GA3","type":"General Assembly","sdg_links":[3,4,5,10,16],"desc":"Social, humanitarian, and cultural issues.","typical_size":[60,193]},
    {"id":"GA4","name":"General Assembly Fourth Committee","abbr":"GA4","type":"General Assembly","sdg_links":[16,17],"desc":"Special political and decolonisation.","typical_size":[40,193]},
    {"id":"SC","name":"Security Council","abbr":"SC","type":"Security Council","sdg_links":[16,17],"desc":"Maintenance of international peace and security.","typical_size":[15,15]},
    {"id":"SC-CRISIS","name":"Security Council Crisis","abbr":"SC-CRISIS","type":"Security Council","sdg_links":[16],"desc":"Fast-paced crisis simulation.","typical_size":[15,15]},
    {"id":"ECOSOC","name":"Economic and Social Council","abbr":"ECOSOC","type":"ECOSOC","sdg_links":[1,2,3,8,10,17],"desc":"Economic, social, and environmental coordination.","typical_size":[30,54]},
    {"id":"CSW","name":"Commission on the Status of Women","abbr":"CSW","type":"ECOSOC","sdg_links":[5,10],"desc":"Gender equality and women's empowerment.","typical_size":[30,45]},
    {"id":"CPD","name":"Commission on Population and Development","abbr":"CPD","type":"ECOSOC","sdg_links":[3,5,10,11],"desc":"Population, health, and development nexus.","typical_size":[20,47]},
    {"id":"UNEP","name":"UN Environment Programme","abbr":"UNEP","type":"Specialised Agency","sdg_links":[13,14,15],"desc":"International environmental coordination.","typical_size":[30,193]},
    {"id":"WHO","name":"World Health Organization","abbr":"WHO","type":"Specialised Agency","sdg_links":[3],"desc":"International public health governance.","typical_size":[30,193]},
    {"id":"UNESCO","name":"UNESCO","abbr":"UNESCO","type":"Specialised Agency","sdg_links":[4,5,10],"desc":"Education, science, culture, and communication.","typical_size":[30,193]},
    {"id":"ILO","name":"International Labour Organization","abbr":"ILO","type":"Specialised Agency","sdg_links":[8,10],"desc":"Labour standards, employment, and decent work.","typical_size":[20,187]},
    {"id":"FAO","name":"Food and Agriculture Organization","abbr":"FAO","type":"Specialised Agency","sdg_links":[2,15],"desc":"Food security, agriculture, and rural development.","typical_size":[30,194]},
    {"id":"UNHCR","name":"UN High Commissioner for Refugees","abbr":"UNHCR","type":"Specialised Agency","sdg_links":[10,16],"desc":"Protection and support for refugees.","typical_size":[20,100]},
    {"id":"UNICEF","name":"UN Children's Fund","abbr":"UNICEF","type":"Specialised Agency","sdg_links":[1,2,3,4,5],"desc":"Children's rights, welfare, and development.","typical_size":[20,100]},
    {"id":"UNDP","name":"UN Development Programme","abbr":"UNDP","type":"Specialised Agency","sdg_links":[1,8,9,16,17],"desc":"Sustainable development and poverty eradication.","typical_size":[30,177]},
    {"id":"WFP","name":"World Food Programme","abbr":"WFP","type":"Specialised Agency","sdg_links":[2],"desc":"Food assistance and hunger relief.","typical_size":[20,100]},
    {"id":"IMF","name":"International Monetary Fund","abbr":"IMF","type":"Specialised Agency","sdg_links":[1,8,17],"desc":"International monetary cooperation.","typical_size":[15,190]},
    {"id":"WTO","name":"World Trade Organization","abbr":"WTO","type":"Specialised Agency","sdg_links":[8,9,17],"desc":"International trade rules and dispute resolution.","typical_size":[20,164]},
    {"id":"SOCHUM","name":"SOCHUM","abbr":"SOCHUM","type":"Special Committee","sdg_links":[3,4,5,10,16],"desc":"Social, Cultural and Humanitarian.","typical_size":[30,150]},
    {"id":"DISEC","name":"DISEC","abbr":"DISEC","type":"Special Committee","sdg_links":[16],"desc":"Disarmament and International Security.","typical_size":[30,150]},
    {"id":"SPECPOL","name":"SPECPOL","abbr":"SPECPOL","type":"Special Committee","sdg_links":[10,16,17],"desc":"Special Political and Decolonization.","typical_size":[30,150]},
    {"id":"LEGAL","name":"Legal Committee","abbr":"LEGAL","type":"Special Committee","sdg_links":[16],"desc":"International law and legal frameworks.","typical_size":[20,150]},
    {"id":"JCC","name":"Joint Crisis Committee","abbr":"JCC","type":"Crisis","sdg_links":[16,17],"desc":"Multi-room crisis with directives.","typical_size":[10,30]},
    {"id":"ICC","name":"International Criminal Court","abbr":"ICC","type":"Crisis","sdg_links":[16],"desc":"International criminal adjudication.","typical_size":[10,20]},
    {"id":"HIST","name":"Historical Crisis Committee","abbr":"HIST","type":"Crisis","sdg_links":[16,17],"desc":"Historical counterfactual simulation.","typical_size":[10,30]},
]
